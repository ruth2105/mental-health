import { api } from './apiClient';

// Backend currently exposes a simple health endpoint at /api/community/health/
// Map listPosts to the health endpoint for now and provide clear errors
// for endpoints not implemented on the backend yet.
export async function listPosts(params) {
  const res = await api.get('/api/community/health/', { params });
  return res.data;
}

export async function createPost(payload) {
  throw new Error('createPost: backend has no posts endpoint (not implemented)');
}

export async function listComments(postId) {
  throw new Error('listComments: backend has no comments endpoint (not implemented)');
}

export async function createComment(postId, payload) {
  throw new Error('createComment: backend has no comments endpoint (not implemented)');
}


