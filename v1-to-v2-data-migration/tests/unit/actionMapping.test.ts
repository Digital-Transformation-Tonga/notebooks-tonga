import { transform } from '../../helpers/transform.ts'
import { assertEquals } from 'https://deno.land/std@0.210.0/assert/mod.ts'
import {
  buildHistoryItem,
  buildSimpleEventRegistration as buildEventRegistration,
} from '../utils/testHelpers.ts'

Deno.test('transform - basic action type mappings', async (t) => {
  await t.step(
    'should map DECLARED regStatus to DECLARE action with annotation',
    () => {
      const history = [
        buildHistoryItem({
          regStatus: 'DECLARED',
          comments: [{ comment: 'Declaration comment' }],
        }),
      ]
      const registration = buildEventRegistration({
        history,
        registration: {
          trackingId: 'TRACK123',
          informantsSignature: 'http://localhost/ocrvs/signature.png',
        },
      })

      const result = transform(registration, {}, 'birth')

      const declareAction = result.actions.find((a) => a.type === 'DECLARE')
      assertEquals(declareAction !== undefined, true)
      assertEquals(
        declareAction?.annotation?.['review.comment'],
        'Declaration comment'
      )
      assertEquals(
        declareAction?.annotation?.['review.signature']?.type,
        'image/png'
      )
    }
  )

  await t.step(
    'should map REGISTERED regStatus to REGISTER action with registrationNumber',
    () => {
      const history = [
        buildHistoryItem({
          regStatus: 'REGISTERED',
          comments: [{ comment: 'Registration comment' }],
        }),
      ]
      const registration = buildEventRegistration({
        history,
        registration: {
          trackingId: 'TRACK123',
          registrationNumber: 'REG123',
          informantsSignature: 'http://localhost/ocrvs/signature.png',
        },
      })

      const result = transform(registration, {}, 'birth')

      const registerAction = result.actions.find((a) => a.type === 'REGISTER')
      assertEquals(registerAction !== undefined, true)
      assertEquals(registerAction?.registrationNumber, 'REG123')
      assertEquals(
        registerAction?.annotation?.['review.comment'],
        'Registration comment'
      )
    }
  )

  await t.step(
    'should use legacyRegistrationDate for REGISTER action createdAt',
    () => {
      const history = [
        buildHistoryItem({
          date: '2025-01-20T10:00:00.000Z',
          regStatus: 'REGISTERED',
        }),
      ]
      const registration = buildEventRegistration({
        history,
        registration: {
          trackingId: 'TRACK123',
          registrationNumber: 'REG123',
        },
      })
      const resolver = {
        'legacyInfo.legacyRegistrationDate': () => '1990-03-15',
      }

      const result = transform(registration, resolver, 'birth')

      const createAction = result.actions.find((a) => a.type === 'CREATE')
      const registerAction = result.actions.find(
        (a) => a.type === 'REGISTER' && a.registrationNumber
      )
      assertEquals(
        registerAction?.createdAt.startsWith('1990-03-15'),
        true
      )
      assertEquals(
        new Date(registerAction!.createdAt).valueOf() >
          new Date(createAction!.createdAt).valueOf(),
        true
      )
      assertEquals(result.createdAt.startsWith('1990-03-15'), true)
    }
  )

  await t.step(
    'should preserve action order when shifting legacyRegistrationDate',
    () => {
      const history = [
        buildHistoryItem({
          date: '2025-01-10T10:00:00.000Z',
          regStatus: 'DECLARED',
        }),
        buildHistoryItem({
          date: '2025-01-15T10:00:00.000Z',
          regStatus: 'VALIDATED',
        }),
        buildHistoryItem({
          date: '2025-01-20T10:00:00.000Z',
          regStatus: 'REGISTERED',
        }),
      ]
      const registration = buildEventRegistration({
        history,
        registration: {
          trackingId: 'TRACK123',
          registrationNumber: 'REG123',
        },
      })
      const resolver = {
        'legacyInfo.legacyRegistrationDate': () => '1990-03-15',
      }

      const result = transform(registration, resolver, 'birth')
      const actionDates = result.actions.map((a) => ({
        type: a.type,
        createdAt: a.createdAt,
      }))

      for (let i = 1; i < actionDates.length; i++) {
        assertEquals(
          new Date(actionDates[i].createdAt).valueOf() >=
            new Date(actionDates[i - 1].createdAt).valueOf(),
          true
        )
      }

      const registerAction = result.actions.find(
        (a) => a.type === 'REGISTER' && a.registrationNumber
      )
      assertEquals(
        registerAction?.createdAt.startsWith('1990-03-15'),
        true
      )
    }
  )

  await t.step(
    'should not shift timestamps when record is pending external validation',
    () => {
      const history = [
        buildHistoryItem({
          date: '2025-01-20T10:00:00.000Z',
          regStatus: 'WAITING_VALIDATION',
        }),
      ]
      const registration = buildEventRegistration({ history })
      const resolver = {
        'legacyInfo.legacyRegistrationDate': () => '1990-03-15',
      }

      const result = transform(registration, resolver, 'birth')

      assertEquals(
        result.createdAt,
        new Date('2025-01-20T10:00:00.000Z').toISOString()
      )
    }
  )

  await t.step(
    'should map WAITING_VALIDATION regStatus to REGISTER action with Requested status',
    () => {
      const acceptedRegisterAction = buildHistoryItem({
        regStatus: 'REGISTERED'
      })

      const history = [
        buildHistoryItem({ regStatus: 'WAITING_VALIDATION' }),
        acceptedRegisterAction
      ]
      const registration = buildEventRegistration({ history })

      const result = transform(registration, {}, 'birth')

      const registerAction = result.actions.find(
        (a) => a.type === 'REGISTER' && a.status === 'Requested'
      )
      assertEquals(registerAction !== undefined, true)
    }
  )

  await t.step(
    'should map VALIDATED regStatus to VALIDATE action with annotation',
    () => {
      const history = [
        buildHistoryItem({
          regStatus: 'VALIDATED',
          comments: [{ comment: 'Validation comment' }],
        }),
      ]
      const registration = buildEventRegistration({
        history,
        registration: {
          trackingId: 'TRACK123',
          informantsSignature: 'http://localhost/ocrvs/signature.png',
        },
      })

      const result = transform(registration, {}, 'birth')

      const validateAction = result.actions.find((a) => a.type === 'VALIDATE')
      assertEquals(validateAction !== undefined, true)
      assertEquals(
        validateAction?.annotation?.['review.comment'],
        'Validation comment'
      )
    }
  )

  await t.step(
    'should map REJECTED regStatus to REJECT action with content.reason',
    () => {
      const history = [
        buildHistoryItem({
          regStatus: 'REJECTED',
          statusReason: { text: 'Invalid documents' },
        }),
      ]
      const registration = buildEventRegistration({ history })

      const result = transform(registration, {}, 'birth')

      const rejectAction = result.actions.find((a) => a.type === 'REJECT')
      assertEquals(rejectAction !== undefined, true)
      assertEquals(rejectAction?.status, 'Accepted')
      assertEquals(rejectAction?.content?.reason, 'Invalid documents')
    }
  )

  await t.step(
    'should map ARCHIVED regStatus to ARCHIVE action with content.reason',
    () => {
      const history = [
        buildHistoryItem({
          regStatus: 'ARCHIVED',
          statusReason: { text: 'Archived for audit' },
        }),
      ]
      const registration = buildEventRegistration({ history })

      const result = transform(registration, {}, 'birth')

      const archiveAction = result.actions.find((a) => a.type === 'ARCHIVE')
      assertEquals(archiveAction !== undefined, true)
      assertEquals(archiveAction?.content?.reason, 'Archived for audit')
    }
  )

  await t.step('should map ASSIGNED action to ASSIGN with assignedTo', () => {
    const history = [
      buildHistoryItem({
        action: 'ASSIGNED',
        user: { id: 'assignee-456', role: { id: 'REGISTRAR' } },
      }),
    ]
    const registration = buildEventRegistration({ history })

    const result = transform(registration, {}, 'birth')

    const assignAction = result.actions.find((a) => a.type === 'ASSIGN')
    assertEquals(assignAction !== undefined, true)
    assertEquals(assignAction?.assignedTo, 'assignee-456')
  })

  await t.step(
    'should map FLAGGED_AS_POTENTIAL_DUPLICATE to DUPLICATE_DETECTED with content.duplicates',
    () => {
      const history = [
        buildHistoryItem({
          action: 'FLAGGED_AS_POTENTIAL_DUPLICATE',
        }),
      ]
      const registration = buildEventRegistration({
        history,
        registration: {
          trackingId: 'TRACK123',
          duplicates: [
            { compositionId: 'dup-1', trackingId: 'TRACK456' },
            { compositionId: 'dup-2', trackingId: 'TRACK789' },
          ],
        },
      })

      const result = transform(registration, {}, 'birth')

      const duplicateAction = result.actions.find(
        (a) => a.type === 'DUPLICATE_DETECTED'
      )
      assertEquals(duplicateAction !== undefined, true)
      assertEquals(duplicateAction?.content?.duplicates?.length, 2)
      assertEquals(duplicateAction?.content?.duplicates?.[0]?.id, 'dup-1')
      assertEquals(
        duplicateAction?.content?.duplicates?.[0]?.trackingId,
        'TRACK456'
      )
    }
  )

  await t.step(
    'should map MARKED_AS_DUPLICATE action to MARK_AS_DUPLICATE',
    () => {
      const history = [buildHistoryItem({ action: 'MARKED_AS_DUPLICATE' })]
      const registration = buildEventRegistration({ history })

      const result = transform(registration, {}, 'birth')

      const markDupAction = result.actions.find(
        (a) => a.type === 'MARK_AS_DUPLICATE'
      )
      assertEquals(markDupAction !== undefined, true)
    }
  )

  await t.step(
    'should map MARKED_AS_NOT_DUPLICATE action to MARK_AS_NOT_DUPLICATE',
    () => {
      const history = [buildHistoryItem({ action: 'MARKED_AS_NOT_DUPLICATE' })]
      const registration = buildEventRegistration({ history })

      const result = transform(registration, {}, 'birth')

      const markNotDupAction = result.actions.find(
        (a) => a.type === 'MARK_AS_NOT_DUPLICATE'
      )
      assertEquals(markNotDupAction !== undefined, true)
    }
  )

  await t.step('should map DOWNLOADED action to READ', () => {
    const history = [buildHistoryItem({ action: 'DOWNLOADED' })]
    const registration = buildEventRegistration({ history })

    const result = transform(registration, {}, 'birth')

    const readAction = result.actions.find((a) => a.type === 'READ')
    assertEquals(readAction !== undefined, true)
  })

  await t.step('should map VIEWED action to READ', () => {
    const history = [buildHistoryItem({ action: 'VIEWED' })]
    const registration = buildEventRegistration({ history })

    const result = transform(registration, {}, 'birth')

    const readAction = result.actions.find((a) => a.type === 'READ')
    assertEquals(readAction !== undefined, true)
  })

  await t.step('should map UNASSIGNED action to UNASSIGN', () => {
    const history = [buildHistoryItem({ action: 'UNASSIGNED' })]
    const registration = buildEventRegistration({ history })

    const result = transform(registration, {}, 'birth')

    const unassignAction = result.actions.find((a) => a.type === 'UNASSIGN')
    assertEquals(unassignAction !== undefined, true)
  })

  await t.step('should map VERIFIED action to VALIDATE', () => {
    const history = [buildHistoryItem({ action: 'VERIFIED' })]
    const registration = buildEventRegistration({ history })

    const result = transform(registration, {}, 'birth')

    const validateAction = result.actions.find((a) => a.type === 'VALIDATE')
    assertEquals(validateAction !== undefined, true)
  })

  await t.step('should always create a CREATE action as first action', () => {
    const history = [buildHistoryItem({ regStatus: 'DECLARED' })]
    const registration = buildEventRegistration({ history })

    const result = transform(registration, {}, 'birth')

    assertEquals(result.actions[0].type, 'CREATE')
  })

  await t.step('should handle multiple actions in sequence', () => {
    const history = [
      buildHistoryItem({ regStatus: 'DECLARED', date: '2023-10-01T12:00:00Z' }),
      buildHistoryItem({
        regStatus: 'REGISTERED',
        date: '2023-10-02T12:00:00Z',
      }),
      buildHistoryItem({ action: 'VIEWED', date: '2023-10-03T12:00:00Z' }),
    ]
    const registration = buildEventRegistration({ history })

    const result = transform(registration, {}, 'birth')

    assertEquals(result.actions.length, 4) // CREATE + 3 history items
    assertEquals(result.actions[0].type, 'CREATE')
    assertEquals(result.actions[1].type, 'DECLARE')
    assertEquals(result.actions[2].type, 'REGISTER')
    assertEquals(result.actions[3].type, 'READ')
  })
})

Deno.test(
  'transform - should map ISSUED/CERTIFIED to PRINT_CERTIFICATE with content and annotation',
  () => {
    const history = [
      buildHistoryItem({
        regStatus: 'DECLARED',
        date: '2023-10-01T10:00:00Z',
      }),
      buildHistoryItem({
        regStatus: 'CERTIFIED',
        date: '2023-10-01T12:00:00Z',
        certificates: [{ certificateTemplateId: 'template-1' }],
      }),
      buildHistoryItem({
        regStatus: 'ISSUED',
        date: '2023-10-01T13:00:00Z',
        certificates: [
          {
            certificateTemplateId: 'template-1',
            hasShowedVerifiedDocument: true,
            collector: {
              relationship: 'MOTHER',
              identifier: [{ id: '123456', type: 'NATIONAL_ID' }],
              name: [{ firstNames: 'Jane', familyName: 'Doe' }],
            },
          },
        ],
      }),
    ]
    const registration = buildEventRegistration({ history })

    const result = transform(registration, {}, 'birth')

    const printAction = result.actions.find(
      (a) => a.type === 'PRINT_CERTIFICATE'
    )
    assertEquals(printAction !== undefined, true)
    assertEquals(printAction?.content?.templateId, 'template-1')
    assertEquals(printAction?.annotation?.['collector.requesterId'], 'MOTHER')
    assertEquals(printAction?.annotation?.['collector.nid'], '123456')
    assertEquals(printAction?.annotation?.['collector.identity.verify'], true)
  }
)

Deno.test('transform - correction action mappings', async (t) => {
  await t.step(
    'should map REQUESTED_CORRECTION action to REQUEST_CORRECTION',
    () => {
      const history = [
        buildHistoryItem({
          action: 'REQUESTED_CORRECTION',
          output: [
            {
              valueCode: 'informant',
              valueId: 'registrationPhone',
              value: '0788787290',
            },
          ],
        }),
      ]
      const registration = buildEventRegistration({ history })

      const result = transform(registration, {}, 'birth')

      const requestAction = result.actions.find(
        (a) => a.type === 'REQUEST_CORRECTION'
      )
      assertEquals(requestAction !== undefined, true)
    }
  )

  await t.step(
    'should map APPROVED_CORRECTION with requestId and annotation',
    () => {
      const history = [
        buildHistoryItem({
          action: 'APPROVED_CORRECTION',
          requestId: 'req-123',
          annotation: { isImmediateCorrection: true },
        }),
      ]
      const registration = buildEventRegistration({ history })

      const result = transform(registration, {}, 'birth')

      const approveAction = result.actions.find(
        (a) => a.type === 'APPROVE_CORRECTION'
      )
      assertEquals(approveAction !== undefined, true)
      assertEquals(approveAction?.status, 'Accepted')
      assertEquals(approveAction?.requestId, 'req-123')
      assertEquals(approveAction?.annotation?.isImmediateCorrection, true)
    }
  )

  await t.step(
    'should map REJECTED_CORRECTION with requestId and content.reason',
    () => {
      const history = [
        buildHistoryItem({
          action: 'REJECTED_CORRECTION',
          requestId: 'req-123',
          reason: 'Insufficient evidence',
        }),
      ]
      const registration = buildEventRegistration({ history })

      const result = transform(registration, {}, 'birth')

      const rejectCorrectionAction = result.actions.find(
        (a) => a.type === 'REJECT_CORRECTION'
      )
      assertEquals(rejectCorrectionAction !== undefined, true)
      assertEquals(rejectCorrectionAction?.status, 'Accepted')
      assertEquals(rejectCorrectionAction?.requestId, 'req-123')
      assertEquals(
        rejectCorrectionAction?.content?.reason,
        'Insufficient evidence'
      )
    }
  )
})

Deno.test(
  'transform - CORRECTED should create REQUEST_CORRECTION and APPROVE_CORRECTION actions',
  () => {
    const history = [
      buildHistoryItem({
        action: 'CORRECTED',
        date: '2023-10-01T12:00:00Z',
        output: [
          {
            valueCode: 'informant',
            valueId: 'registrationPhone',
            value: '0788787290',
          },
        ],
      }),
    ]
    const registration = buildEventRegistration({ history })

    const result = transform(registration, {}, 'birth')

    // CORRECTED should be split into REQUEST_CORRECTION and APPROVE_CORRECTION
    const requestAction = result.actions.find(
      (a) => a.type === 'REQUEST_CORRECTION'
    )
    const approveAction = result.actions.find(
      (a) => a.type === 'APPROVE_CORRECTION'
    )

    assertEquals(requestAction !== undefined, true)
    assertEquals(approveAction !== undefined, true)

    // The approve action should have the request action's ID as requestId
    if (requestAction && approveAction) {
      assertEquals(approveAction.requestId, requestAction.id)
    }
  }
)

Deno.test('transform - should merge ISSUED and CERTIFIED actions', () => {
  const history = [
    buildHistoryItem({
      regStatus: 'CERTIFIED',
      date: '2023-10-01T12:00:00Z',
      certificates: [{ certificateTemplateId: 'template-1' }],
    }),
    buildHistoryItem({
      regStatus: 'ISSUED',
      date: '2023-10-01T13:00:00Z',
      certificates: [{ certificateTemplateId: 'template-1' }],
    }),
  ]
  const registration = buildEventRegistration({ history })

  const result = transform(registration, {}, 'birth')

  // Should create PRINT_CERTIFICATE action and filter out CERTIFIED
  const printActions = result.actions.filter(
    (a) => a.type === 'PRINT_CERTIFICATE'
  )
  assertEquals(printActions.length, 1)
})

Deno.test(
  'transform - should link REQUEST_CORRECTION and APPROVE_CORRECTION actions via requestId',
  () => {
    const history = [
      buildHistoryItem({
        action: 'REQUESTED_CORRECTION',
        date: '2023-10-01T12:00:00Z',
        output: [
          {
            valueCode: 'informant',
            valueId: 'registrationPhone',
            value: '0788787290',
          },
        ],
      }),
      buildHistoryItem({
        action: 'APPROVED_CORRECTION',
        date: '2023-10-02T12:00:00Z',
      }),
    ]
    const registration = buildEventRegistration({ history })

    const result = transform(registration, {}, 'birth')

    const requestAction = result.actions.find(
      (a) => a.type === 'REQUEST_CORRECTION'
    )
    const approveAction = result.actions.find(
      (a) => a.type === 'APPROVE_CORRECTION'
    )

    // The preprocessing should link them via requestId
    if (requestAction && approveAction) {
      assertEquals(approveAction.requestId, requestAction.id)
    }
  }
)
