import { Question } from '../models/Question.js';
import { User } from '../models/User.js';

export async function listGlobalFeed(req, res, next) {
  // TODO:
  // Hint: filter status='answered', visibility='public'.
  // Optional ?tag=xxx: first find user ids with that tag (User.find({tags: xxx}).distinct('_id')),
  //   then add recipient: { $in: ids } to the filter. If no users match, return empty page.
  // Populate recipient with: username displayName avatarUrl tags.
  // Sort answeredAt desc. Pagination envelope { data, page, limit, total, totalPages }.
  // See: docs/API.md "GET /api/feed", tester/tests/global-feed.test.js
  const { tag } = req.query;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const skip = (page - 1) * limit;
  const filter = { status: "answered", visibility: "public" };
  if (tag) {
    const userIds = await User.find({ tags: tag }).distinct("_id");
    if (userIds.length > 0) {
      filter.recipient = { $in: userIds };
    } else {
      return res.status(200).json({
        data: [],
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 0,
      });
    }
  }
  const questions = await Question.find(filter)
    .sort({ answeredAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate("recipient", "username displayName avatarUrl tags")
    .exec();
  const total = await Question.countDocuments(filter);
  const totalPages = Math.ceil(total / limit);
  res.status(200).json({
    data: questions,
    page,
    limit,
    total,
    totalPages,
  });
}
