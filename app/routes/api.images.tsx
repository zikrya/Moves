import type { ActionArgs } from "@remix-run/node";
import { typedjson } from "remix-typedjson";
import { generateImageUrls } from "~/s3.server";
import { requireUserId } from "~/session.server";

export const action = async ({ request }: ActionArgs) => {
  const userId = await requireUserId(request);
  const { get, put } = await generateImageUrls(userId);
  return typedjson({ get, put });
};
