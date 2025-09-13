import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { aiDomainService, HSCodeSuggestRequest, LandedCostRequest, FreightQuoteRequest } from '../services/AIDomainService';

const AIDomainScreen = () => {
  const [activeTab, setActiveTab] = useState('hsCode');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any>(null);

  // HS Code Tab
  const [hsCodeForm, setHsCodeForm] = useState<HSCodeSuggestRequest>({
    title: '',
    materials: '',
    use: '',
    country_origin: ''
  });

  // Landed Cost Tab
  const [landedCostForm, setLandedCostForm] = useState<LandedCostRequest>({
    destination_country: 'US',
    incoterm: 'DDP',
    items: [{
      sku: '',
      value: 0,
      qty: 1,
      uom: 'pieces',
      origin: 'CN'
    }],
    freight_cost: 0,
    insurance_cost: 0,
    currency: 'USD'
  });

  // Freight Quote Tab
  const [freightForm, setFreightForm] = useState<FreightQuoteRequest>({
    mode: 'Air',
    dimensions: [{
      l_cm: 30,
      w_cm: 20,
      h_cm: 15,
      qty: 1
    }],
    weight_kg: 5,
    origin: 'Shanghai, CN',
    destination: 'Los Angeles, US',
    service_level: 'balanced'
  });

  const handleHSCodeSuggestion = async () => {
    if (!hsCodeForm.title.trim()) {
      Alert.alert('Error', 'Please enter a product title');
      return;
    }

    setLoading(true);
    try {
      const result = await aiDomainService.suggestHSCodes(hsCodeForm);
      setResults(result);
    } catch (error) {
      Alert.alert('Error', 'Failed to get HS code suggestions');
    } finally {
      setLoading(false);
    }
  };

  const handleLandedCostCalculation = async () => {
    if (!landedCostForm.items[0].sku.trim()) {
      Alert.alert('Error', 'Please enter product SKU');
      return;
    }

    setLoading(true);
    try {
      const result = await aiDomainService.calculateLandedCost(landedCostForm);
      setResults(result);
    } catch (error) {
      Alert.alert('Error', 'Failed to calculate landed cost');
    } finally {
      setLoading(false);
    }
  };

  const handleFreightQuote = async () => {
    setLoading(true);
    try {
      const result = await aiDomainService.getFreightQuote(freightForm);
      setResults(result);
    } catch (error) {
      Alert.alert('Error', 'Failed to get freight quote');
    } finally {
      setLoading(false);
    }
  };

  const renderTabButton = (tabId: string, title: string, icon: string) => (
    <TouchableOpacity
      style={[styles.tabButton, activeTab === tabId && styles.activeTab]}
      onPress={() => {
        setActiveTab(tabId);
        setResults(null);
      }}
    >
      <Ionicons name={icon as any} size={20} color={activeTab === tabId ? '#007AFF' : '#666'} />
      <Text style={[styles.tabText, activeTab === tabId && styles.activeTabText]}>{title}</Text>
    </TouchableOpacity>
  );

  const renderHSCodeTab = () => (
    <View style={styles.tabContent}>
      <Text style={styles.tabTitle}>🏷️ HS Code Classification</Text>
      <Text style={styles.tabSubtitle}>Get AI-powered HS code suggestions for international trade</Text>
      
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Product Title *</Text>
        <TextInput
          style={styles.input}
          value={hsCodeForm.title}
          onChangeText={(text) => setHsCodeForm({...hsCodeForm, title: text})}
          placeholder="e.g., Wireless Bluetooth Headphones"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Materials</Text>
        <TextInput
          style={styles.input}
          value={hsCodeForm.materials}
          onChangeText={(text) => setHsCodeForm({...hsCodeForm, materials: text})}
          placeholder="e.g., plastic, metal, electronics"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Use/Purpose</Text>
        <TextInput
          style={styles.input}
          value={hsCodeForm.use}
          onChangeText={(text) => setHsCodeForm({...hsCodeForm, use: text})}
          placeholder="e.g., consumer electronics"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Country of Origin</Text>
        <TextInput
          style={styles.input}
          value={hsCodeForm.country_origin}
          onChangeText={(text) => setHsCodeForm({...hsCodeForm, country_origin: text})}
          placeholder="e.g., CN, US, DE"
        />
      </View>

      <TouchableOpacity style={styles.submitButton} onPress={handleHSCodeSuggestion} disabled={loading}>
        {loading ? <ActivityIndicator color="white" /> : (
          <>
            <Ionicons name="search" size={20} color="white" />
            <Text style={styles.submitButtonText}>Get HS Code Suggestions</Text>
          </>
        )}
      </TouchableOpacity>

      {results && results.candidates && (
        <View style={styles.resultsContainer}>
          <Text style={styles.resultsTitle}>HS Code Suggestions</Text>
          {results.candidates.map((suggestion: any, index: number) => (
            <View key={index} style={styles.suggestionCard}>
              <View style={styles.suggestionHeader}>
                <Text style={styles.hsCode}>{suggestion.hs}</Text>
                <View style={styles.confidenceBadge}>
                  <Text style={styles.confidenceText}>{Math.round(suggestion.confidence * 100)}%</Text>
                </View>
              </View>
              <Text style={styles.hsDescription}>{suggestion.desc}</Text>
            </View>
          ))}
          {results.notes && results.notes.length > 0 && (
            <View style={styles.notesContainer}>
              <Text style={styles.notesTitle}>AI Analysis Notes:</Text>
              {results.notes.map((note: string, index: number) => (
                <Text key={index} style={styles.noteText}>• {note}</Text>
              ))}
            </View>
          )}
        </View>
      )}
    </View>
  );

  const renderLandedCostTab = () => (
    <View style={styles.tabContent}>
      <Text style={styles.tabTitle}>💰 Landed Cost Calculator</Text>
      <Text style={styles.tabSubtitle}>Calculate total cost including duties, taxes, and fees</Text>
      
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Destination Country *</Text>
        <TextInput
          style={styles.input}
          value={landedCostForm.destination_country}
          onChangeText={(text) => setLandedCostForm({...landedCostForm, destination_country: text})}
          placeholder="US"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Incoterm</Text>
        <TextInput
          style={styles.input}
          value={landedCostForm.incoterm}
          onChangeText={(text) => setLandedCostForm({...landedCostForm, incoterm: text})}
          placeholder="DDP"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Product SKU *</Text>
        <TextInput
          style={styles.input}
          value={landedCostForm.items[0].sku}
          onChangeText={(text) => setLandedCostForm({
            ...landedCostForm, 
            items: [{...landedCostForm.items[0], sku: text}]
          })}
          placeholder="PROD-001"
        />
      </View>

      <View style={styles.row}>
        <View style={[styles.inputGroup, {flex: 1, marginRight: 8}]}>
          <Text style={styles.label}>Value ($)</Text>
          <TextInput
            style={styles.input}
            value={landedCostForm.items[0].value.toString()}
            onChangeText={(text) => setLandedCostForm({
              ...landedCostForm, 
              items: [{...landedCostForm.items[0], value: parseFloat(text) || 0}]
            })}
            placeholder="100"
            keyboardType="numeric"
          />
        </View>
        
        <View style={[styles.inputGroup, {flex: 1, marginLeft: 8}]}>
          <Text style={styles.label}>Quantity</Text>
          <TextInput
            style={styles.input}
            value={landedCostForm.items[0].qty.toString()}
            onChangeText={(text) => setLandedCostForm({
              ...landedCostForm, 
              items: [{...landedCostForm.items[0], qty: parseInt(text) || 1}]
            })}
            placeholder="1"
            keyboardType="numeric"
          />
        </View>
      </View>

      <TouchableOpacity style={styles.submitButton} onPress={handleLandedCostCalculation} disabled={loading}>
        {loading ? <ActivityIndicator color="white" /> : (
          <>
            <Ionicons name="calculator" size={20} color="white" />
            <Text style={styles.submitButtonText}>Calculate Landed Cost</Text>
          </>
        )}
      </TouchableOpacity>

      {results && results.total_landed_cost !== undefined && (
        <View style={styles.resultsContainer}>
          <Text style={styles.resultsTitle}>Landed Cost Breakdown</Text>
          <View style={styles.costBreakdown}>
            <View style={styles.costRow}>
              <Text style={styles.costLabel}>Product Value:</Text>
              <Text style={styles.costValue}>${(landedCostForm.items[0].value * landedCostForm.items[0].qty).toFixed(2)}</Text>
            </View>
            <View style={styles.costRow}>
              <Text style={styles.costLabel}>Duties:</Text>
              <Text style={styles.costValue}>${results.duty?.toFixed(2) || '0.00'}</Text>
            </View>
            <View style={styles.costRow}>
              <Text style={styles.costLabel}>Taxes:</Text>
              <Text style={styles.costValue}>${results.tax?.toFixed(2) || '0.00'}</Text>
            </View>
            <View style={styles.costRow}>
              <Text style={styles.costLabel}>Fees:</Text>
              <Text style={styles.costValue}>${results.fees?.toFixed(2) || '0.00'}</Text>
            </View>
            <View style={[styles.costRow, styles.totalRow]}>
              <Text style={styles.totalLabel}>Total Landed Cost:</Text>
              <Text style={styles.totalValue}>${results.total_landed_cost.toFixed(2)}</Text>
            </View>
          </View>
          {results.assumptions && (
            <View style={styles.assumptionsContainer}>
              <Text style={styles.assumptionsTitle}>Assumptions & Notes:</Text>
              {results.assumptions.map((assumption: string, index: number) => (
                <Text key={index} style={styles.assumptionText}>• {assumption}</Text>
              ))}
            </View>
          )}
        </View>
      )}
    </View>
  );

  const renderFreightTab = () => (
    <View style={styles.tabContent}>
      <Text style={styles.tabTitle}>🚛 Freight Quote</Text>
      <Text style={styles.tabSubtitle}>Get shipping quotes and delivery estimates</Text>
      
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Transport Mode</Text>
        <View style={styles.modeButtons}>
          {['Air', 'Sea FCL', 'Sea LCL', 'Road', 'Courier'].map(mode => (
            <TouchableOpacity
              key={mode}
              style={[styles.modeButton, freightForm.mode === mode && styles.activeModeButton]}
              onPress={() => setFreightForm({...freightForm, mode: mode as any})}
            >
              <Text style={[styles.modeButtonText, freightForm.mode === mode && styles.activeModeButtonText]}>
                {mode}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Origin</Text>
        <TextInput
          style={styles.input}
          value={freightForm.origin}
          onChangeText={(text) => setFreightForm({...freightForm, origin: text})}
          placeholder="Shanghai, CN"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Destination</Text>
        <TextInput
          style={styles.input}
          value={freightForm.destination}
          onChangeText={(text) => setFreightForm({...freightForm, destination: text})}
          placeholder="Los Angeles, US"
        />
      </View>

      <View style={styles.row}>
        <View style={[styles.inputGroup, {flex: 1, marginRight: 8}]}>
          <Text style={styles.label}>Weight (kg)</Text>
          <TextInput
            style={styles.input}
            value={freightForm.weight_kg.toString()}
            onChangeText={(text) => setFreightForm({...freightForm, weight_kg: parseFloat(text) || 0})}
            placeholder="5"
            keyboardType="numeric"
          />
        </View>
        
        <View style={[styles.inputGroup, {flex: 1, marginLeft: 8}]}>
          <Text style={styles.label}>Service Level</Text>
          <View style={styles.serviceButtons}>
            {['speed', 'balanced', 'economy'].map(level => (
              <TouchableOpacity
                key={level}
                style={[styles.serviceButton, freightForm.service_level === level && styles.activeServiceButton]}
                onPress={() => setFreightForm({...freightForm, service_level: level as any})}
              >
                <Text style={[styles.serviceButtonText, freightForm.service_level === level && styles.activeServiceButtonText]}>
                  {level.charAt(0).toUpperCase() + level.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>

      <TouchableOpacity style={styles.submitButton} onPress={handleFreightQuote} disabled={loading}>
        {loading ? <ActivityIndicator color="white" /> : (
          <>
            <Ionicons name="airplane" size={20} color="white" />
            <Text style={styles.submitButtonText}>Get Freight Quote</Text>
          </>
        )}
      </TouchableOpacity>

      {results && results.options && (
        <View style={styles.resultsContainer}>
          <Text style={styles.resultsTitle}>Freight Options</Text>
          {results.options.map((option: any, index: number) => (
            <View key={index} style={styles.freightCard}>
              <View style={styles.freightHeader}>
                <Text style={styles.carrierName}>{option.carrier}</Text>
                <Text style={styles.freightCost}>${option.cost?.toFixed(2) || 'N/A'}</Text>
              </View>
              <View style={styles.freightDetails}>
                <Text style={styles.freightEta}>📅 {option.eta_days} days</Text>
                <Text style={styles.freightNotes}>{option.notes}</Text>
              </View>
            </View>
          ))}
          {results.volumetric_weight_kg && (
            <View style={styles.volumetricInfo}>
              <Text style={styles.volumetricText}>
                Volumetric Weight: {results.volumetric_weight_kg.toFixed(2)} kg
              </Text>
            </View>
          )}
        </View>
      )}
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🌍 AI Trade Intelligence</Text>
        <Text style={styles.subtitle}>Global commerce tools powered by AI</Text>
      </View>

      <View style={styles.tabContainer}>
        {renderTabButton('hsCode', 'HS Codes', 'pricetag')}
        {renderTabButton('landedCost', 'Landed Cost', 'calculator')}
        {renderTabButton('freight', 'Freight', 'airplane')}
      </View>

      {activeTab === 'hsCode' && renderHSCodeTab()}
      {activeTab === 'landedCost' && renderLandedCostTab()}
      {activeTab === 'freight' && renderFreightTab()}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    padding: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e1e5e9',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    marginHorizontal: 4,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: '#007AFF',
  },
  tabText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#666',
  },
  activeTabText: {
    color: 'white',
  },
  tabContent: {
    padding: 20,
  },
  tabTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  tabSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 24,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e1e5e9',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: 'white',
  },
  row: {
    flexDirection: 'row',
  },
  modeButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  modeButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#f8f9fa',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#e1e5e9',
  },
  activeModeButton: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  modeButtonText: {
    fontSize: 12,
    color: '#666',
  },
  activeModeButtonText: {
    color: 'white',
  },
  serviceButtons: {
    flexDirection: 'row',
    gap: 4,
  },
  serviceButton: {
    flex: 1,
    paddingVertical: 8,
    backgroundColor: '#f8f9fa',
    borderRadius: 6,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e1e5e9',
  },
  activeServiceButton: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  serviceButtonText: {
    fontSize: 10,
    color: '#666',
  },
  activeServiceButtonText: {
    color: 'white',
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    marginTop: 8,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  resultsContainer: {
    marginTop: 24,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
  },
  resultsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 16,
  },
  suggestionCard: {
    borderWidth: 1,
    borderColor: '#e1e5e9',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  suggestionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  hsCode: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  confidenceBadge: {
    backgroundColor: '#e8f5e8',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  confidenceText: {
    fontSize: 12,
    color: '#28a745',
    fontWeight: '600',
  },
  hsDescription: {
    fontSize: 14,
    color: '#666',
  },
  notesContainer: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  notesTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  noteText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  costBreakdown: {
    borderWidth: 1,
    borderColor: '#e1e5e9',
    borderRadius: 8,
    padding: 16,
  },
  costRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f3f4',
  },
  totalRow: {
    borderBottomWidth: 0,
    borderTopWidth: 2,
    borderTopColor: '#007AFF',
    marginTop: 8,
    paddingTop: 12,
  },
  costLabel: {
    fontSize: 14,
    color: '#666',
  },
  costValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  totalValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  assumptionsContainer: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#fff8e1',
    borderRadius: 8,
  },
  assumptionsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  assumptionText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  freightCard: {
    borderWidth: 1,
    borderColor: '#e1e5e9',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  freightHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  carrierName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  freightCost: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#28a745',
  },
  freightDetails: {
    gap: 4,
  },
  freightEta: {
    fontSize: 14,
    color: '#666',
  },
  freightNotes: {
    fontSize: 12,
    color: '#999',
  },
  volumetricInfo: {
    marginTop: 12,
    padding: 8,
    backgroundColor: '#f8f9fa',
    borderRadius: 6,
  },
  volumetricText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
});

export default AIDomainScreen;