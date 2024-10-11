import ImagePicker from 'react-native-image-crop-picker';
export const uploadSingleImg = async () => {
  try {
    const img = await ImagePicker.openPicker({
      width: 300,
      height: 300,
      compressImageQuality: 1,
      cropping: true,
      includeBase64: true,
      mediaType: 'photo',
    });
    return img;
  } catch (e) {
    return Promise.reject(e);
  }
};
