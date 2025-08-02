import { IPoll, IPollOption } from "../types/post_type";
import { v4 as uuidv4 } from "uuid";
import createMediaItemFromCloudinaryFile from "../utils/create_media_Item_from_cloudinary_file";
import {
  extractHashtags,
  extractMentions,
  validatePostContent,
} from "../utils/content_moderation";

export class PostDataService {
  static async processPoll(poll: any): Promise<IPoll | undefined> {
    if (!poll) return undefined;

    const { question, options, allowMultipleChoices, expiresAt } = poll;

    if (!question || !Array.isArray(options) || options.length < 2) {
      throw new Error("Poll must have a question and at least 2 options");
    }

    const mappedOptions: IPollOption[] = options.map((opt: any) => ({
      id: uuidv4(),
      text: opt.text || "",
      voteCount: 0,
      voters: [],
    }));

    return {
      question: question.trim(),
      options: mappedOptions,
      allowMultipleChoices: !!allowMultipleChoices,
      expiresAt: expiresAt ? new Date(expiresAt) : undefined,
      totalVotes: 0,
      isActive: true,
    };
  }

  static async processContent(
    text: string,
    files: any[],
    customHashtags: string[],
    mentionedUserIds: string[]
  ) {
    const mediaItems = files?.map(createMediaItemFromCloudinaryFile) || [];
    const contentCheck = await validatePostContent(text, mediaItems);

    const extractedHashtags = text ? extractHashtags(text) : [];
    const extractedMentions = text ? await extractMentions(text) : [];

    // Create a Set from the array of extracted hashtags and custom hashtags
    // This automatically removes any duplicates
    const hashtagSet = new Set([...extractedHashtags, ...customHashtags]);

    // Create an array from the Set, this gives us a new array with all
    // unique hashtags
    const allHashtags = Array.from(hashtagSet);

    // Do the same for mentions
    const mentionSet = new Set([...extractedMentions, ...mentionedUserIds]);
    const allMentions = Array.from(mentionSet) as string[];

    return {
      mediaItems,
      contentCheck,
      hashtags: allHashtags,
      mentions: allMentions,
    };
  }
}
