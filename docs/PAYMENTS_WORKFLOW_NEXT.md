# Payments Workflow Follow-up (Property Pulse)

Per product direction: apply the same operational pattern used for leasing ops to payments workflows.

## Planned scope

1. Add payments ops summary endpoint integration in Property Pulse UI.
   - delinquency queue + priorityScore + priorityWeights
   - payment failures/returns
   - accounts needing follow-up

2. Add `bulkActions` driven payments console.
   - candidate actions:
     - SEND_PAYMENT_REMINDER
     - RETRY_FAILED_PAYMENT
     - OPEN_COLLECTION_FOLLOWUP
     - RECONCILE_ACCOUNT

3. Add two-step safety flow for high-impact payment actions.
   - simulate preview
   - confirm with simulationToken match

4. Add execution audit visibility.
   - per-item success/failure
   - operator and timestamp context

## Status
- Not yet implemented in Property Pulse frontend.
- Backend capabilities are available in pms-master and should be wired next.
