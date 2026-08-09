import { NativeModules } from 'react-native';

const { LocalAI } = NativeModules;

export const testLocalModel = async () => {
  try {
    const exists = await LocalAI.checkModel();

    console.log('====================');
    console.log('MODEL EXISTS:', exists);
    console.log('====================');

    return exists;
  } catch (error) {
       console.log('Not found model file. Please make sure the model file is placed in the correct location.');
    console.error('MODEL CHECK ERROR:', error);
  }
};