import React, { useState, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Dimensions,
  Alert,
  ScrollView
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Camera, CameraType } from 'expo-camera';
import { Video, ResizeMode } from 'expo-av';
// import * as MediaLibrary from 'expo-media-library';

const { width, height } = Dimensions.get('window');

interface Product {
  id: string;
  name: string;
  brand: string;
  price: number;
  image: string;
}

interface ProductPin {
  id: string;
  product: Product;
  position: { x: number; y: number };
}

const SAMPLE_PRODUCTS: Product[] = [
  {
    id: 'p1',
    name: 'Luxury Silk Dress',
    brand: 'Designer Label',
    price: 599,
    image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=200&h=200&fit=crop'
  },
  {
    id: 'p2',
    name: 'Premium Handbag',
    brand: 'Luxury Craft',
    price: 399,
    image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=200&h=200&fit=crop'
  },
  {
    id: 'p3',
    name: 'Smart Watch',
    brand: 'Tech Pro',
    price: 299,
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200&h=200&fit=crop'
  },
];

export default function CreatorToolsScreen() {
  const insets = useSafeAreaInsets();
  const [step, setStep] = useState<'capture' | 'tag' | 'publish'>('capture');
  const [recording, setRecording] = useState(false);
  const [videoUri, setVideoUri] = useState<string | null>(null);
  const [productPins, setProductPins] = useState<ProductPin[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showProductSelector, setShowProductSelector] = useState(false);
  const [pendingPinPosition, setPendingPinPosition] = useState<{ x: number; y: number } | null>(null);
  const cameraRef = useRef<Camera>(null);

  // Request permissions
  React.useEffect(() => {
    (async () => {
      const { status: cameraStatus } = await Camera.requestCameraPermissionsAsync();
      const { status: audioStatus } = await Camera.requestMicrophonePermissionsAsync();
      const { status: mediaStatus } = await MediaLibrary.requestPermissionsAsync();
      
      if (cameraStatus !== 'granted' || audioStatus !== 'granted' || mediaStatus !== 'granted') {
        Alert.alert('Permissions Required', 'Camera, microphone, and media library access are required for creator tools.');
      }
    })();
  }, []);

  const startRecording = async () => {
    if (cameraRef.current && !recording) {
      try {
        setRecording(true);
        const video = await cameraRef.current.recordAsync({
          quality: '1080p',
          maxDuration: 60, // 60 seconds max
        });
        setVideoUri(video.uri);
        setStep('tag');
      } catch (error) {
        console.error('Recording failed:', error);
        Alert.alert('Recording Failed', 'Please try again.');
      } finally {
        setRecording(false);
      }
    }
  };

  const stopRecording = () => {
    if (cameraRef.current && recording) {
      cameraRef.current.stopRecording();
      setRecording(false);
    }
  };

  const handleVideoTap = (event: any) => {
    if (step !== 'tag') return;
    
    const { locationX, locationY } = event.nativeEvent;
    const position = {
      x: locationX / width,
      y: locationY / (height * 0.7) // Adjust for video area
    };
    
    setPendingPinPosition(position);
    setShowProductSelector(true);
  };

  const addProductPin = (product: Product) => {
    if (pendingPinPosition) {
      const newPin: ProductPin = {
        id: `pin_${Date.now()}`,
        product,
        position: pendingPinPosition
      };
      
      setProductPins([...productPins, newPin]);
      setShowProductSelector(false);
      setPendingPinPosition(null);
    }
  };

  const removeProductPin = (pinId: string) => {
    setProductPins(productPins.filter(pin => pin.id !== pinId));
  };

  const publishPost = async () => {
    try {
      // Mock API call to publish post
      const postData = {
        videoUri,
        productPins,
        caption: 'Check out these amazing finds! #AisleOOTD',
        tags: ['#fashion', '#style', '#shopping']
      };
      
      console.log('Publishing post:', postData);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      Alert.alert(
        'Post Published!',
        'Your shopping post is now live on AisleMarts Socialise!',
        [
          {
            text: 'View in Feed',
            onPress: () => router.push('/social')
          },
          {
            text: 'Create Another',
            onPress: () => {
              setStep('capture');
              setVideoUri(null);
              setProductPins([]);
            }
          }
        ]
      );
    } catch (error) {
      console.error('Publishing failed:', error);
      Alert.alert('Publishing Failed', 'Please try again.');
    }
  };

  const renderCaptureStep = () => (
    <View style={styles.captureContainer}>
      <Camera
        ref={cameraRef}
        style={styles.camera}
        type={CameraType.back}
        ratio="16:9"
      >
        <View style={styles.cameraOverlay}>
          {/* Recording indicator */}
          {recording && (
            <View style={styles.recordingIndicator}>
              <View style={styles.recordingDot} />
              <Text style={styles.recordingText}>REC</Text>
            </View>
          )}
          
          {/* Instructions */}
          <View style={styles.instructionsContainer}>
            <Text style={styles.instructionsText}>
              Create your shopping content
            </Text>
            <Text style={styles.instructionsSubtext}>
              Show off your style and products you love
            </Text>
          </View>
          
          {/* Record button */}
          <View style={styles.recordButtonContainer}>
            <TouchableOpacity
              style={[styles.recordButton, recording && styles.recordButtonActive]}
              onPress={recording ? stopRecording : startRecording}
            >
              <View style={[styles.recordButtonInner, recording && styles.recordButtonInnerActive]} />
            </TouchableOpacity>
          </View>
        </View>
      </Camera>
    </View>
  );

  const renderTagStep = () => (
    <View style={styles.tagContainer}>
      <View style={styles.videoContainer}>
        {videoUri && (
          <TouchableOpacity
            style={styles.videoTouchArea}
            onPress={handleVideoTap}
            activeOpacity={1}
          >
            <Video
              source={{ uri: videoUri }}
              style={styles.video}
              resizeMode={ResizeMode.CONTAIN}
              isLooping
              shouldPlay
            />
            
            {/* Product pins overlay */}
            {productPins.map((pin) => (
              <View
                key={pin.id}
                style={[
                  styles.productPin,
                  {
                    left: pin.position.x * width - 12,
                    top: pin.position.y * (height * 0.7) - 12,
                  }
                ]}
              >
                <TouchableOpacity
                  style={styles.productPinButton}
                  onPress={() => removeProductPin(pin.id)}
                >
                  <Text style={styles.productPinText}>🛍️</Text>
                </TouchableOpacity>
                
                {/* Product tooltip */}
                <View style={styles.productTooltip}>
                  <Text style={styles.tooltipName}>{pin.product.name}</Text>
                  <Text style={styles.tooltipPrice}>${pin.product.price}</Text>
                </View>
              </View>
            ))}
          </TouchableOpacity>
        )}
      </View>
      
      <View style={styles.tagInstructions}>
        <Text style={styles.tagTitle}>Tag Products</Text>
        <Text style={styles.tagSubtitle}>
          Tap on your video to add "Shop the Look" pins
        </Text>
        <Text style={styles.tagCount}>
          {productPins.length} products tagged
        </Text>
      </View>
      
      <TouchableOpacity
        style={[styles.nextButton, productPins.length > 0 && styles.nextButtonActive]}
        onPress={() => productPins.length > 0 && setStep('publish')}
        disabled={productPins.length === 0}
      >
        <LinearGradient
          colors={productPins.length > 0 ? ['#E8C968', '#D4AF37'] : ['#666', '#555']}
          style={styles.nextButtonGradient}
        >
          <Text style={styles.nextButtonText}>Continue to Publish</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );

  const renderPublishStep = () => (
    <View style={styles.publishContainer}>
      <ScrollView contentContainerStyle={styles.publishContent}>
        <Text style={styles.publishTitle}>Ready to Publish</Text>
        
        {/* Preview */}
        <View style={styles.publishPreview}>
          {videoUri && (
            <Video
              source={{ uri: videoUri }}
              style={styles.previewVideo}
              resizeMode={ResizeMode.COVER}
              isLooping
              shouldPlay={false}
            />
          )}
          <View style={styles.previewOverlay}>
            <Text style={styles.previewStats}>
              🛍️ {productPins.length} products • 👁️ Ready for discovery
            </Text>
          </View>
        </View>
        
        {/* Tagged products */}
        <View style={styles.taggedProducts}>
          <Text style={styles.taggedTitle}>Tagged Products</Text>
          {productPins.map((pin) => (
            <View key={pin.id} style={styles.taggedProductItem}>
              <Text style={styles.taggedProductName}>{pin.product.name}</Text>
              <Text style={styles.taggedProductPrice}>${pin.product.price}</Text>
            </View>
          ))}
        </View>
        
        <TouchableOpacity style={styles.publishButton} onPress={publishPost}>
          <LinearGradient
            colors={['#E8C968', '#D4AF37']}
            style={styles.publishButtonGradient}
          >
            <Text style={styles.publishButtonText}>🚀 Publish to AisleMarts</Text>
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );

  const renderProductSelector = () => (
    <View style={styles.productSelector}>
      <View style={styles.productSelectorHeader}>
        <Text style={styles.productSelectorTitle}>Select Product</Text>
        <TouchableOpacity
          style={styles.productSelectorClose}
          onPress={() => setShowProductSelector(false)}
        >
          <Text style={styles.productSelectorCloseText}>✕</Text>
        </TouchableOpacity>
      </View>
      
      <ScrollView style={styles.productList}>
        {SAMPLE_PRODUCTS.map((product) => (
          <TouchableOpacity
            key={product.id}
            style={styles.productItem}
            onPress={() => addProductPin(product)}
          >
            <Text style={styles.productItemName}>{product.name}</Text>
            <Text style={styles.productItemBrand}>{product.brand}</Text>
            <Text style={styles.productItemPrice}>${product.price}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <LinearGradient
        colors={['#0C0F14', '#1a1a2e', '#16213e']}
        style={StyleSheet.absoluteFill}
      />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <LinearGradient
            colors={['#E8C968', '#D4AF37']}
            style={styles.titleBadge}
          >
            <Text style={styles.titleBadgeText}>CREATOR</Text>
          </LinearGradient>
          <Text style={styles.headerTitle}>Creator Tools</Text>
          <Text style={styles.headerSubtitle}>Create shoppable content</Text>
        </View>
      </View>
      
      {/* Step indicator */}
      <View style={styles.stepIndicator}>
        <View style={[styles.stepDot, step === 'capture' && styles.stepDotActive]}>
          <Text style={styles.stepNumber}>1</Text>
        </View>
        <View style={styles.stepLine} />
        <View style={[styles.stepDot, step === 'tag' && styles.stepDotActive]}>
          <Text style={styles.stepNumber}>2</Text>
        </View>
        <View style={styles.stepLine} />
        <View style={[styles.stepDot, step === 'publish' && styles.stepDotActive]}>
          <Text style={styles.stepNumber}>3</Text>
        </View>
      </View>
      
      {/* Content */}
      <View style={styles.content}>
        {step === 'capture' && renderCaptureStep()}
        {step === 'tag' && renderTagStep()}
        {step === 'publish' && renderPublishStep()}
      </View>
      
      {/* Product selector modal */}
      {showProductSelector && renderProductSelector()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0C0F14',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  backButtonText: {
    fontSize: 20,
    color: '#ffffff',
    fontWeight: '600',
  },
  headerContent: {
    flex: 1,
  },
  titleBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    marginBottom: 8,
  },
  titleBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#000',
    letterSpacing: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
  },
  stepIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  stepDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepDotActive: {
    backgroundColor: '#E8C968',
  },
  stepNumber: {
    fontSize: 14,
    fontWeight: '700',
    color: '#000',
  },
  stepLine: {
    width: 40,
    height: 2,
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginHorizontal: 8,
  },
  content: {
    flex: 1,
  },
  captureContainer: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
  cameraOverlay: {
    flex: 1,
    backgroundColor: 'transparent',
    justifyContent: 'space-between',
    paddingVertical: 40,
  },
  recordingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: 'rgba(255,0,0,0.8)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  recordingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#fff',
    marginRight: 6,
  },
  recordingText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#fff',
  },
  instructionsContainer: {
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  instructionsText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 8,
  },
  instructionsSubtext: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
  },
  recordButtonContainer: {
    alignItems: 'center',
  },
  recordButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: 'rgba(255,255,255,0.5)',
  },
  recordButtonActive: {
    borderColor: '#ff4444',
  },
  recordButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#ff4444',
  },
  recordButtonInnerActive: {
    width: 30,
    height: 30,
    borderRadius: 4,
  },
  tagContainer: {
    flex: 1,
    paddingHorizontal: 24,
  },
  videoContainer: {
    flex: 1,
    backgroundColor: '#000',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 20,
  },
  videoTouchArea: {
    flex: 1,
    position: 'relative',
  },
  video: {
    flex: 1,
  },
  productPin: {
    position: 'absolute',
    width: 24,
    height: 24,
  },
  productPinButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#E8C968',
    justifyContent: 'center',
    alignItems: 'center',
  },
  productPinText: {
    fontSize: 12,
  },
  productTooltip: {
    position: 'absolute',
    top: -50,
    left: -40,
    width: 100,
    backgroundColor: 'rgba(0,0,0,0.8)',
    borderRadius: 8,
    padding: 8,
    borderWidth: 1,
    borderColor: '#E8C968',
  },
  tooltipName: {
    fontSize: 10,
    color: '#fff',
    fontWeight: '600',
    marginBottom: 2,
  },
  tooltipPrice: {
    fontSize: 10,
    color: '#E8C968',
    fontWeight: '700',
  },
  tagInstructions: {
    alignItems: 'center',
    marginBottom: 20,
  },
  tagTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
  },
  tagSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
    marginBottom: 8,
  },
  tagCount: {
    fontSize: 12,
    color: '#E8C968',
    fontWeight: '600',
  },
  nextButton: {
    marginBottom: 20,
  },
  nextButtonActive: {
    // Active styles handled by gradient colors
  },
  nextButtonGradient: {
    paddingVertical: 14,
    borderRadius: 25,
    alignItems: 'center',
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
  },
  publishContainer: {
    flex: 1,
    paddingHorizontal: 24,
  },
  publishContent: {
    paddingBottom: 40,
  },
  publishTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 24,
  },
  publishPreview: {
    height: 200,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 24,
    position: 'relative',
  },
  previewVideo: {
    flex: 1,
  },
  previewOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 12,
  },
  previewStats: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '600',
  },
  taggedProducts: {
    marginBottom: 24,
  },
  taggedTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 12,
  },
  taggedProductItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  taggedProductName: {
    fontSize: 14,
    color: '#fff',
    flex: 1,
  },
  taggedProductPrice: {
    fontSize: 14,
    fontWeight: '700',
    color: '#E8C968',
  },
  publishButton: {
    // Style handled by gradient
  },
  publishButtonGradient: {
    paddingVertical: 16,
    borderRadius: 25,
    alignItems: 'center',
  },
  publishButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
  },
  productSelector: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '50%',
    backgroundColor: '#1a1a2e',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },
  productSelectorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  productSelectorTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
  productSelectorClose: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  productSelectorCloseText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
  productList: {
    flex: 1,
  },
  productItem: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  productItemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  productItemBrand: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    marginBottom: 8,
  },
  productItemPrice: {
    fontSize: 14,
    fontWeight: '700',
    color: '#E8C968',
  },
});