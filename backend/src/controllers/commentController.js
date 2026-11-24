const commentService = require('../services/commentService');
const postService = require('../services/postService');

async function listComments(req, res) {
  const post = await postService.getPost(req.params.postId);
  res.json(await commentService.listComments(post));
}

async function createComment(req, res) {
  const post = await postService.getPost(req.params.postId);
  const { text, parentId } = req.body || {};
  const comment = await commentService.createComment({ post, text, parentId, user: req.user });
  res.status(201).json(comment);
}

module.exports = { listComments, createComment };
