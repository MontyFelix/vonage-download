const failLogger = require('simple-node-logger').createSimpleLogger('failLogger.log');
const fs = require('fs');

const downloadByDateRange = async (icsClient, start, end) => {
  console.log(`Searching for interactions between '${start}' - '${end}'\n`);
  try {
    let pageNumber = 1; //counter used for logging not used for paging
    let nextContinuationToken = undefined;
    do {
      console.log(`Getting page ${pageNumber}`);
      const searchPage = await icsClient.search(
        start,
        end,
        nextContinuationToken
      );
      await downloadPage(icsClient, searchPage.items);
      nextContinuationToken = searchPage.meta.nextContinuationToken;
      pageNumber++;
    } while (nextContinuationToken);
  } catch (error) {
    failLogger.info(error, 'nextContinuationToken: ', nextContinuationToken, 'start date: ', start, 'end date: ', end)
    return "Error occurred";
  }
  return "All Done";
};

async function downloadPage(icsClient, items) {
  for (const i of items) {
    try {
      // possibly that this needs to be replaced with checking file extension (wav and webm)
      // if webm fles have contentKey !== to callRecording
      const filteredContent = i.content.filter((c) => c.contentKey === 'callRecording')
      await icsClient.downloadAllContent(i.guid, filteredContent);
    } catch(e) {
      failLogger.info('downloadPage error', i.guid)
      console.log(e, 'error HANDLER -1')
    }
  }
}

module.exports = downloadByDateRange;
