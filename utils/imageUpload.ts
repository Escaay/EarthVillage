import ImagePicker from 'react-native-image-crop-picker';
export const uploadSingleImg = async (
  isMultiple: boolean = true,
  width?: any,
  height?: any,
): Promise<any> => {
  try {
    const img = await ImagePicker.openPicker({
      width,
      height,
      compressImageQuality: 1,
      cropping: true,
      // compressImageMaxHeight: 500,
      includeBase64: true,
      mediaType: 'photo',
      multiple: isMultiple,
    });
    return img;
  } catch (e) {
    console.log(e);
    return Promise.reject(e);
  }
};
