import * as zulip from 'zulip-js';
import { STREAM_ID } from './constants';

interface IZulipConfig {
  ZULIP_USERNAME?: string;
  ZULIP_API_KEY?: string;
  ZULIP_REALM?: string;
}

// Subset of user data defined by Zulip API:
// https://zulipchat.com/api/get-all-users
interface ZulipUser {
  is_active: boolean;
  user_id: number;
  full_name: string;
  is_bot: boolean;
  email: string;
}

export const initZulipAPI = async function(
  zulipConfig: IZulipConfig = {}
): void {
  // set up Zulip JS library
  const config = {
    username: zulipConfig.ZULIP_USERNAME || process.env.ZULIP_USERNAME,
    apiKey: zulipConfig.ZULIP_API_KEY || process.env.ZULIP_API_KEY,
    realm: zulipConfig.ZULIP_REALM || process.env.ZULIP_REALM
  };
  const zulipAPI = await zulip(config);

  // Get all Zulip user info for the users subscribed to the coffee chats stream
  const getZulipUsers = async function(): ZulipUser[] {
    // First get user data (name, ID, is_bot, etc) for ALL Zulip users
    const allZulipUsers = (await zulipAPI.users.retrieve()).members;

    // Next, retrieve every stream that Coffee Bot is subscribed to...
    const botSubsResponse = await zulipAPI.streams.subscriptions.retrieve();

    // ...and get the user emails subscribed to STREAM_ID (the coffee bot channel)
    let allSubscribedEmails = botSubsResponse.subscriptions.filter(
      sub => sub.stream_id === STREAM_ID
    )[0].subscribers;

    // Return only non-bot zulip users who are subscribed to coffee chats stream
    return allZulipUsers.filter(user => {
      return !user.is_bot && allSubscribedEmails.includes(user.email);
    });
  };

  // Store Zulip users who signed up for coffee chats (private var of this module)
  const zulipCoffeeUsers: ZulipUser[] = getZulipUsers();

  // Send a message to a given Zulip user
  const sendMessage = function(toEmail: string, messageContent: string) {
    zulipAPI.messages.send({
      to: toEmail,
      type: 'private',
      content: messageContent
    });
  };

  // Store subscribed emails array (expose this to other modules)
  const subscribedEmails: string[] = zulipCoffeeUsers.map(user => user.email);

  return {
    subscribedEmails,
    sendMessage
  };
};
