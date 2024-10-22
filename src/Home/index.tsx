import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image } from 'react-native';
import ImagePicker, { ImageOrVideo, Image as ImagePickerImage } from 'react-native-image-crop-picker';
import axios from 'axios';

// interface CupomScannerProps {
//   onScan: (text: string) => void;
// }

const GOOGLE_CLOUD_VISION_API_KEY = 'key';

// export function Home({ onScan }: CupomScannerProps) {
export function Home() {
  const [image, setImage] = useState<string | null>(null);

  const pickImage = async () => {

    ImagePicker.openCamera({
        width:1000,
        height: 1000,
        cropping: true,
        freeStyleCropEnabled: true,
        cropperCircleOverlay: true,
        // cropperActiveWidgetColor: colors.primary,
        // cropperStatusBarColor: colors.primary,
        // cropperToolbarColor: colors.primary,
        cropperToolbarTitle: 'Recorte a imagem',
        cropperChooseText: 'Recortar',
        cropperCancelText: 'Cancelar',
        includeBase64: true,
      })
        .then(async (image: ImagePickerImage) => {
        // console.log('image', {path: image.path, data: image.data})
         setImage(image.path);
         performOCR(image.data);
        })
        .catch((e) => {
          if (e.message !== 'User cancelled image selection') {
           console.log('Erro ao selecionar imagem', e);
          }
        });
    // try {
    //   const result = await ImagePicker.openCamera({
    //     width: 1000,
    //     height: 1000,
    //     cropping: true,
    //     includeBase64: true,
    //   });

    //   if ('path' in result && 'data' in result) {
    //     console.log('result', result)
    //   //  setImage(result.path);
    //   //  performOCR(result.data);
    //   } else {
    //     console.error('Unexpected result from ImagePicker');
    //   }
    // } catch (error) {
    //   console.error('Image picker error:', error);
    // }
  };

//   const performOCR = async (base64Image: string) => {
//     try {
//       const response = await axios.post(
//         `https://vision.googleapis.com/v1/images:annotate?key=${GOOGLE_CLOUD_VISION_API_KEY}`,
//         {
//           requests: [
//             {
//               image: {
//                 content: base64Image,
//               },
//               features: [
//                 {
//                   type: 'TEXT_DETECTION',
//                 },
//               ],
//             },
//             {
//                 headers: {
//                   'Authorization': `Bearer ${GOOGLE_CLOUD_VISION_API_KEY}`,
//                   'Content-Type': 'application/json',
//                 },
//               }
//           ],
//         }
//       );

//       const text = response.data.responses[0].fullTextAnnotation.text;
//      // onScan(text);
//      console.log('text', text)
//     } catch (error) {
//       console.error('OCR Error:', error);
//     }
//   };

const performOCR = async (base64Image: string) => {
    try {
      console.log('Sending request to Google Cloud Vision API...');

      const requestBody = {
        requests: [
          {
            image: {
              content: base64Image,
            },
            features: [
              {
                type: 'TEXT_DETECTION',
              },
            ],
          },
        ],
      };

      console.log('Request body:', JSON.stringify(requestBody, null, 2));

      const response = await axios.post(
        'https://vision.googleapis.com/v1/images:annotate',
        requestBody,
        {
        //   params: {
        //     key: GOOGLE_CLOUD_VISION_API_KEY,
        //   },
          headers: {
            'Authorization': `Bearer ${GOOGLE_CLOUD_VISION_API_KEY}`,
            'Content-Type': 'application/json',
          },
        }
      );

      console.log('Response received:', JSON.stringify(response.data, null, 2));

      if (response.data.responses && response.data.responses[0] && response.data.responses[0].fullTextAnnotation) {
        const text = response.data.responses[0].fullTextAnnotation.text;
      console.log('text', text)
        // onScan(text);
      } else {
        console.error('Unexpected response structure:', response.data);
      }
    } catch (error) {
      console.error('OCR Error:', error);
      if (axios.isAxiosError(error)) {
        console.error('Response data:', error.response?.data);
        console.error('Response status:', error.response?.status);
        console.error('Response headers:', error.response?.headers);
      }
    }
  };

  return (
    <View style={styles.container}>
      {image ? (
        <View style={styles.imageContainer}>
          <Image source={{ uri: image }} style={styles.image} />
          <TouchableOpacity style={styles.button} onPress={pickImage}>
            <Text style={styles.buttonText}>Tirar outra foto</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity style={styles.button} onPress={pickImage}>
          <Text style={styles.buttonText}>Tirar Foto do Cupom</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
      },
      imageContainer: {
        alignItems: 'center',
      },
      image: {
        width: 300,
        height: 300,
        marginBottom: 20,
      },
      button: {
        backgroundColor: '#4CAF50',
        padding: 10,
        borderRadius: 5,
      },
      buttonText: {
        color: 'white',
        fontSize: 16,
      },
});