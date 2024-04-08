import { CronJob } from 'cron'
import { fetchTransferEvents } from './logic/event.js'

function startMonitoring() {
  const job = new CronJob(
    '*/20 * * * * *', // every 20 seconds
    fetchTransferEvents,
  )

  fetchTransferEvents()
  job.start()
}

startMonitoring()