import { createRequestHandler } from './.open-next/worker.js';

export const onRequest: PagesFunction = async (context) => {
  return createRequestHandler(context.request);
};
