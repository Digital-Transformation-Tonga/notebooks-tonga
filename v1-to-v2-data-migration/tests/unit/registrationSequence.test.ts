import { assertEquals } from 'jsr:@std/assert'
import { Database } from 'jsr:@db/sqlite@0.13'

let testChain = Promise.resolve()

function serialTest(name: string, fn: () => Promise<void> | void) {
  Deno.test(name, () => {
    testChain = testChain.then(fn)
    return testChain
  })
}

async function withTempSequenceDb(
  fn: (dbPath: string) => Promise<void> | void
) {
  const dbPath = await Deno.makeTempFile({ suffix: '.db' })
  Deno.env.set('SEQUENCE_SQLITE_PATH', dbPath)

  const seed = new Database(dbPath)
  seed.exec(`
    CREATE TABLE sequence (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      type TEXT NOT NULL,
      year TEXT NOT NULL,
      sequence INTEGER NOT NULL,
      UNIQUE(type, year)
    );
    INSERT INTO sequence (type, year, sequence) VALUES ('birth', '2021', 1861);
    INSERT INTO sequence (type, year, sequence) VALUES ('death', '2021', 0);
  `)
  seed.close()

  try {
    await fn(dbPath)
  } finally {
    Deno.env.delete('SEQUENCE_SQLITE_PATH')
    await Deno.remove(dbPath)
  }
}

serialTest('allocateNextSequence increments and persists the SQLite value', async () => {
  await withTempSequenceDb(async (dbPath) => {
    const { allocateNextSequence } = await import(
      `../../helpers/registrationSequence.ts?allocate-${Date.now()}`
    )

    assertEquals(allocateNextSequence('birth', '2021'), 1862)
    assertEquals(allocateNextSequence('birth', '2021'), 1863)

    const db = new Database(dbPath)
    const row = db
      .prepare('SELECT sequence FROM sequence WHERE type = ? AND year = ?')
      .get('birth', '2021') as { sequence: number }
    db.close()

    assertEquals(row.sequence, 1863)
  })
})

serialTest(
  'regenerateRegistrationNumber uses stored sequence and minimum current value',
  async () => {
    await withTempSequenceDb(async () => {
      const { regenerateRegistrationNumber } = await import(
        `../../helpers/registrationSequence.ts?regen-${Date.now()}`
      )

      assertEquals(
        regenerateRegistrationNumber('TONT/NB/TT/1862/2021', 'birth'),
        'TONT/NB/TT/1863/2021'
      )
      assertEquals(
        regenerateRegistrationNumber('ND/TT/0001/2021', 'death'),
        'ND/TT/0002/2021'
      )
      assertEquals(
        regenerateRegistrationNumber('ND/TT/0002/2021', 'death'),
        'ND/TT/0003/2021'
      )
    })
  }
)

serialTest('tryAssignNewRegistrationNumber updates the migration document', async () => {
  await withTempSequenceDb(async () => {
    const { tryAssignNewRegistrationNumber } = await import(
      `../../helpers/registrationSequence.ts?assign-${Date.now()}`
    )

    const document = {
      type: 'birth',
      trackingId: 'BSFYVCX',
      actions: [
        {
          type: 'REGISTER',
          status: 'Accepted',
          registrationNumber: 'TONT/NB/TT/1862/2021',
        },
      ],
    }

    const change = tryAssignNewRegistrationNumber(document)
    assertEquals(change, {
      previous: 'TONT/NB/TT/1862/2021',
      next: 'TONT/NB/TT/1863/2021',
    })
    assertEquals(
      document.actions[0].registrationNumber,
      'TONT/NB/TT/1863/2021'
    )
  })
})

serialTest('ensureSequenceAtLeast advances SQLite without allocating a new number', async () => {
  await withTempSequenceDb(async (dbPath) => {
    const { ensureSequenceAtLeast } = await import(
      `../../helpers/registrationSequence.ts?ensure-${Date.now()}`
    )

    ensureSequenceAtLeast('birth', '2021', 1870)
    ensureSequenceAtLeast('birth', '2021', 1865)

    const db = new Database(dbPath)
    const row = db
      .prepare('SELECT sequence FROM sequence WHERE type = ? AND year = ?')
      .get('birth', '2021') as { sequence: number }
    db.close()

    assertEquals(row.sequence, 1870)
  })
})

serialTest('prepareDocumentsForImport reassigns duplicate numbers within a batch', async () => {
  await withTempSequenceDb(async () => {
    const {
      prepareDocumentsForImport,
      resetRegistrationNumberSession,
    } = await import(
      `../../helpers/registrationSequence.ts?prepare-${Date.now()}`
    )

    resetRegistrationNumberSession()

    const makeDocument = (trackingId: string) => ({
      type: 'birth',
      trackingId,
      actions: [
        {
          type: 'REGISTER',
          status: 'Accepted',
          registrationNumber: 'TONT/NB/TT/1862/2021',
        },
      ],
    })

    const first = makeDocument('FIRST')
    const second = makeDocument('SECOND')

    prepareDocumentsForImport([first, second])

    assertEquals(
      first.actions[0].registrationNumber,
      'TONT/NB/TT/1862/2021'
    )
    assertEquals(
      second.actions[0].registrationNumber,
      'TONT/NB/TT/1863/2021'
    )
  })
})

serialTest('commitRegistrationNumberFromDocument updates SQLite and session', async () => {
  await withTempSequenceDb(async (dbPath) => {
    const {
      commitRegistrationNumberFromDocument,
      isRegistrationNumberUsedInSession,
      resetRegistrationNumberSession,
    } = await import(
      `../../helpers/registrationSequence.ts?commit-${Date.now()}`
    )

    resetRegistrationNumberSession()

    const document = {
      type: 'birth',
      trackingId: 'COMMIT-1',
      actions: [
        {
          type: 'REGISTER',
          status: 'Accepted',
          registrationNumber: 'TONT/NB/TT/1875/2021',
        },
      ],
    }

    commitRegistrationNumberFromDocument(document)

    assertEquals(
      isRegistrationNumberUsedInSession('TONT/NB/TT/1875/2021'),
      true
    )

    const db = new Database(dbPath)
    const row = db
      .prepare('SELECT sequence FROM sequence WHERE type = ? AND year = ?')
      .get('birth', '2021') as { sequence: number }
    db.close()

    assertEquals(row.sequence, 1875)
  })
})

serialTest(
  'prepareDocumentsForImport avoids numbers already committed in session',
  async () => {
    await withTempSequenceDb(async () => {
      const {
        commitRegistrationNumberFromDocument,
        prepareDocumentsForImport,
        resetRegistrationNumberSession,
      } = await import(
        `../../helpers/registrationSequence.ts?session-${Date.now()}`
      )

      resetRegistrationNumberSession()

      const committed = {
        type: 'birth',
        trackingId: 'DONE',
        actions: [
          {
            type: 'REGISTER',
            status: 'Accepted',
            registrationNumber: 'TONT/NB/TT/1862/2021',
          },
        ],
      }

      commitRegistrationNumberFromDocument(committed)

      const next = {
        type: 'birth',
        trackingId: 'NEXT',
        actions: [
          {
            type: 'REGISTER',
            status: 'Accepted',
            registrationNumber: 'TONT/NB/TT/1862/2021',
          },
        ],
      }

      prepareDocumentsForImport([next])

      assertEquals(
        next.actions[0].registrationNumber,
        'TONT/NB/TT/1863/2021'
      )
    })
  }
)

serialTest(
  'restoreSequenceBaselines reverts increments when import never succeeds',
  async () => {
    await withTempSequenceDb(async (dbPath) => {
      const {
        captureDocumentSequenceBaselines,
        restoreSequenceBaselines,
        tryAssignNewRegistrationNumber,
      } = await import(
        `../../helpers/registrationSequence.ts?restore-${Date.now()}`
      )

      const document = {
        type: 'birth',
        trackingId: 'FAIL-1',
        actions: [
          {
            type: 'REGISTER',
            status: 'Accepted',
            registrationNumber: 'TONT/NB/TT/1862/2021',
          },
        ],
      }

      const baselines = captureDocumentSequenceBaselines(document)
      assertEquals(baselines, [{ type: 'birth', year: '2021', sequence: 1861 }])

      tryAssignNewRegistrationNumber(document)
      tryAssignNewRegistrationNumber(document)
      restoreSequenceBaselines(baselines)

      const db = new Database(dbPath)
      const row = db
        .prepare('SELECT sequence FROM sequence WHERE type = ? AND year = ?')
        .get('birth', '2021') as { sequence: number }
      db.close()

      assertEquals(row.sequence, 1861)
    })
  }
)
