const Parser = require('rss-parser');

let parser = new Parser();

const getFeed = async (party) => {
  const formatted = party.toLowerCase().split(' ').join('+');
  let feed = await parser.parseURL(
    `http://www.chorewars.com/rss/party/${formatted}.rss`
  );

  if (!feed) {
    throw new Error('Unable to read feed.');
  }

  if (feed.items.length < 1) {
    throw new Error('No items in feed.');
  }

  return feed;
};

const getPlaceText = (index) => {
  const placeText = ['1st', '2nd', '3rd'];
  return placeText[index] || `${index + 1}th`;
};

const getThisWeek = async (party) => {
  const lastWeek = new Date(Date.now() - 6 * 24 * 60 * 60 * 1000);
  lastWeek.setHours(0, 0, 0, 0);

  const feed = await getFeed(party);
  const userPointsMap = new Map();

  for (const item of feed.items) {
    const pubDate = new Date(item?.pubDate);
    if (pubDate <= lastWeek) break;

    const user = item.title.split(' earned')[0];
    const points = parseInt(
      item.title.split(' ').find((_word, index, arr) => arr[index + 1] === 'XP')
    );

    userPointsMap.set(user, (userPointsMap.get(user) || 0) + points);
  }

  return Array.from(userPointsMap.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([user, points], index) => {
      return `In ${getPlaceText(index)} place, ${user} has ${points} XP.`;
    })
    .join(' ');
};

module.exports = { getThisWeek };
