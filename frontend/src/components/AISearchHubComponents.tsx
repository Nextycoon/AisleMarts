import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Alert,
  Dimensions,
  Platform,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import {
  aiSearchHubService,
  ToolConfig,
  QuickSearchResponse,
  DeepSearchResponse,
  ImageReadResponse,
  QRScanResponse,
  BarcodeScanResponse,
  VoiceInputResponse,
  SearchResult,
  DeepSearchInsight
} from '../services/AISearchHubService';

const { width, height } = Dimensions.get('window');

interface AISearchHubProps {
  visible: boolean;
  onClose: () => void;
  onSearch: (query: string, results: any) => void;
  initialQuery?: string;
}

interface ToolButtonProps {
  tool: ToolConfig;
  selected: boolean;
  onSelect: () => void;
}

const ToolButton: React.FC<ToolButtonProps> = ({ tool, selected, onSelect }) => (
  <TouchableOpacity
    style={[styles.toolButton, selected && styles.toolButtonSelected]}
    onPress={onSelect}
  >
    <Ionicons 
      name={aiSearchHubService.getToolIcon(tool.id) as any} 
      size={24} 
      color={selected ? '#007AFF' : '#666'} 
    />
    <Text style={[styles.toolButtonText, selected && styles.toolButtonTextSelected]}>
      {tool.label}
    </Text>
  </TouchableOpacity>
);

interface SearchResultsProps {
  results: SearchResult[];
  onProductSelect: (productId: string) => void;
}

const SearchResults: React.FC<SearchResultsProps> = ({ results, onProductSelect }) => (
  <ScrollView style={styles.resultsContainer}>
    <Text style={styles.resultsTitle}>
      Found {results.length} products
    </Text>
    {results.map((result, index) => (
      <TouchableOpacity
        key={`${result.id}-${index}`}
        style={styles.resultCard}
        onPress={() => onProductSelect(result.id)}
      >
        <View style={styles.resultContent}>
          <Text style={styles.resultTitle} numberOfLines={2}>
            {result.title}
          </Text>
          <Text style={styles.resultPrice}>
            {result.currency} {result.price.toFixed(2)}
          </Text>
          <View style={styles.resultMeta}>
            <Text style={styles.resultSeller}>
              {result.seller.country}
            </Text>
            {result.seller.rating && (
              <View style={styles.ratingContainer}>
                <Ionicons name="star" size={12} color="#FFD700" />
                <Text style={styles.ratingText}>
                  {result.seller.rating.toFixed(1)}
                </Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    ))}
  </ScrollView>
);

interface DeepSearchResultsProps {
  insights: DeepSearchInsight[];
}

const DeepSearchResults: React.FC<DeepSearchResultsProps> = ({ insights }) => (
  <ScrollView style={styles.resultsContainer}>
    <Text style={styles.resultsTitle}>Market Insights</Text>
    {insights.map((insight, index) => (
      <View key={index} style={styles.insightCard}>
        <View style={styles.insightHeader}>
          <Ionicons 
            name={insight.type === 'geographic' ? 'location' : insight.type === 'pricing' ? 'cash' : 'analytics'} 
            size={20} 
            color="#007AFF" 
          />
          <Text style={styles.insightTitle}>{insight.title}</Text>
          <Text style={styles.confidenceScore}>
            {Math.round(insight.confidence * 100)}%
          </Text>
        </View>
        <Text style={styles.insightContent}>{insight.content}</Text>
        {insight.data && Array.isArray(insight.data) && (
          <View style={styles.insightData}>
            {insight.data.slice(0, 3).map((item: any, idx: number) => (
              <View key={idx} style={styles.insightDataItem}>
                <Text style={styles.insightDataText}>
                  {item.city}, {item.country}: {item.demand_score}% ({item.reason})
                </Text>
              </View>
            ))}
          </View>
        )}
      </View>
    ))}
  </ScrollView>
);

interface ImageReadResultsProps {
  result: ImageReadResponse;
}

const ImageReadResults: React.FC<ImageReadResultsProps> = ({ result }) => (
  <ScrollView style={styles.resultsContainer}>
    <Text style={styles.resultsTitle}>Image Analysis</Text>
    
    {result.text_blocks.length > 0 && (
      <View style={styles.ocrSection}>
        <Text style={styles.sectionTitle}>Extracted Text</Text>
        {result.text_blocks.map((text, index) => (
          <Text key={index} style={styles.ocrText}>{text}</Text>
        ))}
      </View>
    )}

    {result.entities.length > 0 && (
      <View style={styles.entitiesSection}>
        <Text style={styles.sectionTitle}>Detected Information</Text>
        {result.entities.map((entity, index) => (
          <View key={index} style={styles.entityItem}>
            <Text style={styles.entityType}>
              {entity.type.toUpperCase()}:
            </Text>
            <Text style={styles.entityValue}>{entity.value}</Text>
          </View>
        ))}
      </View>
    )}

    {result.translations && result.translations.length > 0 && (
      <View style={styles.translationsSection}>
        <Text style={styles.sectionTitle}>Translations</Text>
        {result.translations.map((translation, index) => (
          <View key={index} style={styles.translationItem}>
            <Text style={styles.translationOriginal}>
              "{translation.original}"
            </Text>
            <Text style={styles.translationArrow}>→</Text>
            <Text style={styles.translationTranslated}>
              "{translation.translated}"
            </Text>
          </View>
        ))}
      </View>
    )}
  </ScrollView>
);

export const AISearchHub: React.FC<AISearchHubProps> = ({ 
  visible, 
  onClose, 
  onSearch, 
  initialQuery = '' 
}) => {
  const [selectedTool, setSelectedTool] = useState<string>('quick_search');
  const [query, setQuery] = useState(initialQuery);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const slideAnim = useRef(new Animated.Value(height)).current;

  const tools = aiSearchHubService.getToolsConfig();

  useEffect(() => {
    if (visible) {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: height,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  const handleClose = () => {
    Animated.timing(slideAnim, {
      toValue: height,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      onClose();
      setResults(null);
      setError(null);
    });
  };

  const checkPermissions = async (toolId: string): Promise<boolean> => {
    const permissions = aiSearchHubService.requiresPermission(toolId);
    
    if (permissions.camera || permissions.microphone) {
      const permissionType = permissions.camera ? 'camera' : 'microphone';
      const permissionText = permissions.camera ? 
        'Allow camera for QR/Barcode/Image?' : 
        'Allow microphone for Voice?';
      
      return new Promise((resolve) => {
        Alert.alert(
          'Permission Required',
          permissionText,
          [
            { text: 'Cancel', onPress: () => resolve(false) },
            { text: 'Allow', onPress: () => resolve(true) }
          ]
        );
      });
    }
    
    return true;
  };

  const executeSearch = async () => {
    if (!query.trim() && !['qr_scan', 'barcode_scan'].includes(selectedTool)) {
      Alert.alert('Error', 'Please enter a search query');
      return;
    }

    const hasPermission = await checkPermissions(selectedTool);
    if (!hasPermission) return;

    setLoading(true);
    setError(null);
    setResults(null);

    try {
      let result;
      const locale = aiSearchHubService.getUserLocale();

      switch (selectedTool) {
        case 'quick_search':
          result = await aiSearchHubService.quickSearch({
            q: query,
            locale: `${locale.language}-${locale.country}`,
            currency: locale.currency,
            country: locale.country,
            filters: {}
          });
          break;

        case 'deep_search':
          result = await aiSearchHubService.deepSearch({
            objective: query,
            time_horizon: 'current',
            regions: [],
            evidence_required: false
          });
          break;

        case 'image_read':
          // For demo, we'll simulate image upload
          Alert.alert('Image Read', 'Please upload an image to analyze');
          setLoading(false);
          return;

        case 'qr_scan':
          // For demo, we'll simulate QR scanning
          result = await aiSearchHubService.qrScan({
            image_base64: 'data:image/png;base64,product'
          });
          break;

        case 'barcode_scan':
          // For demo, we'll simulate barcode scanning
          result = await aiSearchHubService.barcodeScan({
            image_base64: 'data:image/png;base64,ean13',
            symbologies: ['EAN13', 'UPC']
          });
          break;

        case 'voice_input':
          // For demo, we'll simulate voice input
          result = await aiSearchHubService.voiceInput({
            audio_base64: 'data:audio/wav;base64,sample',
            language_hint: locale.language
          });
          // After getting transcript, perform search
          if (result.transcript) {
            const searchResult = await aiSearchHubService.quickSearch({
              q: result.transcript,
              locale: `${locale.language}-${locale.country}`,
              currency: locale.currency,
              country: locale.country,
              filters: {}
            });
            result = { voice: result, search: searchResult };
          }
          break;

        default:
          throw new Error('Unknown tool');
      }

      setResults(result);
      onSearch(query, result);

    } catch (err: any) {
      setError(err.message || 'Search failed');
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  };

  const renderResults = () => {
    if (!results) return null;

    switch (selectedTool) {
      case 'quick_search':
        return (
          <SearchResults 
            results={results.results || []} 
            onProductSelect={(id) => console.log('Product selected:', id)}
          />
        );

      case 'deep_search':
        return <DeepSearchResults insights={results.insights || []} />;

      case 'image_read':
        return <ImageReadResults result={results} />;

      case 'voice_input':
        return (
          <View style={styles.voiceResults}>
            <View style={styles.transcriptCard}>
              <Text style={styles.transcriptTitle}>Voice Transcript:</Text>
              <Text style={styles.transcriptText}>
                "{results.voice?.transcript || 'No transcript available'}"
              </Text>
              <Text style={styles.transcriptMeta}>
                Language: {results.voice?.language}, 
                Confidence: {Math.round((results.voice?.confidence || 0) * 100)}%
              </Text>
            </View>
            {results.search && (
              <SearchResults 
                results={results.search.results || []} 
                onProductSelect={(id) => console.log('Product selected:', id)}
              />
            )}
          </View>
        );

      case 'qr_scan':
      case 'barcode_scan':
        return (
          <View style={styles.scanResults}>
            <View style={styles.scanCard}>
              <Text style={styles.scanTitle}>
                {selectedTool === 'qr_scan' ? 'QR Code Detected' : 'Barcode Detected'}
              </Text>
              <Text style={styles.scanValue}>
                {results.qr_value || results.barcode_value}
              </Text>
              <Text style={styles.scanAction}>
                Action: {results.next_action || 'Product lookup'}
              </Text>
            </View>
          </View>
        );

      default:
        return <Text style={styles.noResults}>No results to display</Text>;
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={handleClose}
    >
      <View style={styles.modalOverlay}>
        <BlurView intensity={20} style={styles.blurBackground} />
        
        <Animated.View 
          style={[
            styles.modalContainer,
            {
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          {/* Header */}
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>AI Search Hub</Text>
            <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          {/* Tools Selection */}
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.toolsContainer}
          >
            {tools.map((tool) => (
              <ToolButton
                key={tool.id}
                tool={tool}
                selected={selectedTool === tool.id}
                onSelect={() => setSelectedTool(tool.id)}
              />
            ))}
          </ScrollView>

          {/* Search Input */}
          {!['qr_scan', 'barcode_scan'].includes(selectedTool) && (
            <View style={styles.searchContainer}>
              <TextInput
                style={styles.searchInput}
                placeholder={
                  selectedTool === 'voice_input' 
                    ? "Tap the mic or type your query..." 
                    : "What are you looking for?"
                }
                value={query}
                onChangeText={setQuery}
                onSubmitEditing={executeSearch}
                multiline={selectedTool === 'deep_search'}
                numberOfLines={selectedTool === 'deep_search' ? 3 : 1}
              />
              <TouchableOpacity 
                style={styles.searchButton}
                onPress={executeSearch}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Ionicons name="search" size={20} color="white" />
                )}
              </TouchableOpacity>
            </View>
          )}

          {/* Special UI for scan tools */}
          {['qr_scan', 'barcode_scan'].includes(selectedTool) && (
            <View style={styles.scanContainer}>
              <TouchableOpacity 
                style={styles.scanButton}
                onPress={executeSearch}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator size="large" color="white" />
                ) : (
                  <>
                    <Ionicons 
                      name={selectedTool === 'qr_scan' ? 'qr-code-outline' : 'barcode-outline'} 
                      size={48} 
                      color="white" 
                    />
                    <Text style={styles.scanButtonText}>
                      {selectedTool === 'qr_scan' ? 'Scan QR Code' : 'Scan Barcode'}
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          )}

          {/* Error Display */}
          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {/* Results */}
          <View style={styles.resultsWrapper}>
            {renderResults()}
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  blurBackground: {
    ...StyleSheet.absoluteFillObject,
  },
  modalContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: height * 0.85,
    backgroundColor: 'white',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    padding: 8,
  },
  toolsContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  toolButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginRight: 12,
    borderRadius: 16,
    backgroundColor: '#f5f5f5',
    minWidth: 80,
  },
  toolButtonSelected: {
    backgroundColor: '#e3f2fd',
    borderWidth: 2,
    borderColor: '#007AFF',
  },
  toolButtonText: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    textAlign: 'center',
  },
  toolButtonTextSelected: {
    color: '#007AFF',
    fontWeight: '600',
  },
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  searchInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    marginRight: 12,
    backgroundColor: 'white',
    textAlignVertical: 'top',
  },
  searchButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
    alignItems: 'center',
  },
  scanButton: {
    backgroundColor: '#007AFF',
    borderRadius: 16,
    paddingVertical: 24,
    paddingHorizontal: 32,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 200,
  },
  scanButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 8,
  },
  errorContainer: {
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 14,
    textAlign: 'center',
    backgroundColor: '#ffebee',
    padding: 12,
    borderRadius: 8,
  },
  resultsWrapper: {
    flex: 1,
  },
  resultsContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  resultsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  resultCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#eee',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  resultContent: {
    flex: 1,
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  resultPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 8,
  },
  resultMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  resultSeller: {
    fontSize: 14,
    color: '#666',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
  },
  insightCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
  },
  insightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  insightTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginLeft: 8,
    flex: 1,
  },
  confidenceScore: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  insightContent: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 8,
  },
  insightData: {
    marginTop: 8,
  },
  insightDataItem: {
    backgroundColor: 'white',
    padding: 8,
    borderRadius: 6,
    marginBottom: 4,
  },
  insightDataText: {
    fontSize: 12,
    color: '#333',
  },
  ocrSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  ocrText: {
    fontSize: 14,
    color: '#333',
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  entitiesSection: {
    marginBottom: 20,
  },
  entityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f8ff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  entityType: {
    fontSize: 12,
    fontWeight: '600',
    color: '#007AFF',
    marginRight: 8,
    minWidth: 60,
  },
  entityValue: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  translationsSection: {
    marginBottom: 20,
  },
  translationItem: {
    backgroundColor: '#fff3e0',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  translationOriginal: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  translationArrow: {
    fontSize: 16,
    color: '#FF9800',
    textAlign: 'center',
    marginVertical: 4,
  },
  translationTranslated: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  voiceResults: {
    flex: 1,
  },
  transcriptCard: {
    backgroundColor: '#f0f8ff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
  },
  transcriptTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
    marginBottom: 8,
  },
  transcriptText: {
    fontSize: 16,
    color: '#333',
    fontStyle: 'italic',
    marginBottom: 8,
  },
  transcriptMeta: {
    fontSize: 12,
    color: '#666',
  },
  scanResults: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  scanCard: {
    backgroundColor: '#f0f8ff',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#007AFF',
  },
  scanTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 12,
  },
  scanValue: {
    fontSize: 16,
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  scanAction: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  noResults: {
    textAlign: 'center',
    color: '#666',
    fontSize: 16,
    marginTop: 40,
  },
});