import "dotenv/config";

export default ({ config }) => {
  return {
    ...config,
    extra: {
      WEB_CLIENT_ID: process.env.WEB_CLIENT_ID,
      ANDROID_CLIENT_ID: process.env.ANDROID_CLIENT_ID,
    },
  };
};
