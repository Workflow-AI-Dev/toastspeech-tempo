declare module "react-native-mov-to-mp4" {
  const MovToMp4: {
    convertMovToMp4: (
      videoFilePath: string,
      newFilenameMp4: string,
    ) => Promise<string>;
  };
  export default MovToMp4;
}
