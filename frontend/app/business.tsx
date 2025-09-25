import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  FlatList,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');

export default function BusinessScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Products');

  // Alibaba-style business categories
  const categories = [
    { id: 'all', name: 'All Products', icon: '🏭' },
    { id: 'machinery', name: 'Machinery', icon: '⚙️' },
    { id: 'electronics', name: 'Electronics & Electrical', icon: '🔌' },
    { id: 'textile', name: 'Textiles & Leather', icon: '🧵' },
    { id: 'chemicals', name: 'Chemicals', icon: '⚗️' },
    { id: 'construction', name: 'Construction', icon: '🏗️' },
    { id: 'automotive', name: 'Automotive', icon: '🚗' },
    { id: 'packaging', name: 'Packaging & Printing', icon: '📦' },
  ];

  // Alibaba-style B2B suppliers with AisleMarts features
  const suppliers = [
    {
      id: '1',
      companyName: 'Shenzhen Tech Manufacturing Co., Ltd.',
      productName: 'Wireless Earbuds - Bulk Manufacturing',
      moq: '500 pieces',
      price: '$8.50 - $12.30',
      priceUnit: 'piece',
      image: 'https://via.placeholder.com/200x200/1890FF/white?text=Earbuds',
      category: 'electronics',
      supplierType: 'Verified Supplier',
      yearsInBusiness: '8 years',
      tradeAssurance: true,
      responseTime: '< 2 hours',
      country: 'China',
      creatorPartner: '@TechManufacturer',
      aisledealsCommission: '0%',
      factoryDirect: true,
      customization: 'OEM/ODM Available',
      certifications: ['CE', 'FCC', 'RoHS'],
      tradingLevel: 'Gold Supplier'
    },
    {
      id: '2',
      companyName: 'Guangzhou Fashion Textile Factory',
      productName: 'Premium Cotton T-Shirts - Wholesale',
      moq: '200 pieces',
      price: '$3.20 - $5.80',
      priceUnit: 'piece',
      image: 'https://via.placeholder.com/200x200/FF6B6B/white?text=T-Shirts',
      category: 'textile',
      supplierType: 'Trade Assurance',
      yearsInBusiness: '12 years',
      tradeAssurance: true,
      responseTime: '< 1 hour',
      country: 'China',
      creatorPartner: '@FashionFactory',
      aisledealsCommission: '0%',
      factoryDirect: true,
      customization: 'Logo & Design Custom',
      certifications: ['OEKO-TEX', 'GOTS'],
      tradingLevel: 'Diamond Supplier'
    },
    {
      id: '3',
      companyName: 'Mumbai Steel & Machinery Ltd.',
      productName: 'Industrial CNC Machine Parts',
      moq: '50 pieces',
      price: '$45.00 - $120.00',
      priceUnit: 'piece',
      image: 'https://via.placeholder.com/200x200/4ECDC4/white?text=Machinery',
      category: 'machinery',
      supplierType: 'Assessed Supplier',
      yearsInBusiness: '15 years',
      tradeAssurance: true,
      responseTime: '< 4 hours',
      country: 'India',
      creatorPartner: '@IndustrialPro',
      aisledealsCommission: '0%',
      factoryDirect: true,
      customization: 'Custom Specifications',
      certifications: ['ISO 9001', 'CE'],
      tradingLevel: 'Gold Supplier'
    },
    {
      id: '4',
      companyName: 'Dongguan Electronics Assembly Co.',
      productName: 'Smartphone Accessories - OEM/ODM',
      moq: '1000 pieces',
      price: '$2.10 - $4.50',
      priceUnit: 'piece',
      image: 'https://via.placeholder.com/200x200/45B7D1/white?text=Phone+Acc',
      category: 'electronics',
      supplierType: 'Onsite Check',
      yearsInBusiness: '6 years',
      tradeAssurance: true,
      responseTime: '< 3 hours',
      country: 'China',
      creatorPartner: '@MobileAccessory',
      aisledealsCommission: '0%',
      factoryDirect: true,
      customization: 'Full OEM/ODM Service',
      certifications: ['CE', 'FCC'],
      tradingLevel: 'Verified Supplier'
    }
  ];

  const renderSupplier = ({ item }) => (
    <TouchableOpacity style={styles.supplierCard} onPress={() => router.push('/supplier/' + item.id)}>
      <View style={styles.supplierHeader}>
        <Image source={{ uri: item.image }} style={styles.productImage} />
        <View style={styles.supplierBadges}>
          {item.factoryDirect && (
            <View style={styles.factoryBadge}>
              <Text style={styles.factoryText}>🏭 Factory Direct</Text>
            </View>
          )}
          {item.tradeAssurance && (
            <View style={styles.tradeAssuranceBadge}>
              <Text style={styles.tradeAssuranceText}>✅ Trade Assurance</Text>
            </View>
          )}
        </View>
      </View>
      
      <View style={styles.supplierInfo}>
        <Text style={styles.productTitle} numberOfLines={2}>{item.productName}</Text>
        <Text style={styles.companyName} numberOfLines={1}>{item.companyName}</Text>
        
        {/* Price Range */}
        <View style={styles.priceContainer}>
          <Text style={styles.priceRange}>{item.price}</Text>
          <Text style={styles.priceUnit}>/ {item.priceUnit}</Text>
        </View>

        {/* MOQ */}
        <View style={styles.moqContainer}>
          <Text style={styles.moqLabel}>MOQ: </Text>
          <Text style={styles.moqValue}>{item.moq}</Text>
        </View>

        {/* AisleMarts Features */}
        <View style={styles.aisleMartsFeatures}>
          <Text style={styles.creatorPartner}>{item.creatorPartner}</Text>
          <Text style={styles.commissionBadge}>0% Commission</Text>
        </View>

        {/* Supplier Credentials */}
        <View style={styles.supplierCredentials}>
          <Text style={styles.supplierType}>{item.supplierType}</Text>
          <Text style={styles.yearsInBusiness}>{item.yearsInBusiness}</Text>
          <Text style={styles.responseTime}>⚡ {item.responseTime}</Text>
        </View>

        {/* Customization */}
        <Text style={styles.customization}>{item.customization}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Alibaba-style Header */}
      <View style={styles.header}>
        <View style={styles.searchContainer}>
          <TouchableOpacity style={styles.menuButton}>
            <Text style={styles.menuIcon}>☰</Text>
          </TouchableOpacity>
          <View style={styles.searchBar}>
            <Text style={styles.searchIcon}>🔍</Text>
            <TextInput
              style={styles.searchInput}
              placeholder="Search suppliers, products..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor="#999"
            />
            <TouchableOpacity style={styles.sourceButton}>
              <Text style={styles.sourceText}>Source</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={styles.rfqButton}>
            <Text style={styles.rfqIcon}>📋</Text>
          </TouchableOpacity>
        </View>

        {/* Business Services */}
        <View style={styles.servicesContainer}>
          <TouchableOpacity style={styles.serviceButton}>
            <Text style={styles.serviceIcon}>🛡️</Text>
            <Text style={styles.serviceText}>Trade Assurance</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.serviceButton}>
            <Text style={styles.serviceIcon}>🚢</Text>
            <Text style={styles.serviceText}>Logistics</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.serviceButton}>
            <Text style={styles.serviceIcon}>💰</Text>
            <Text style={styles.serviceText}>Financing</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.serviceButton}>
            <Text style={styles.serviceIcon}>📊</Text>
            <Text style={styles.serviceText}>Inspection</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Categories Scroll */}
        <View style={styles.categoriesSection}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesScroll}>
            {categories.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={[styles.categoryButton, selectedCategory === category.name && styles.selectedCategory]}
                onPress={() => setSelectedCategory(category.name)}
              >
                <Text style={styles.categoryIcon}>{category.icon}</Text>
                <Text style={[styles.categoryText, selectedCategory === category.name && styles.selectedCategoryText]}>
                  {category.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* AisleMarts B2B Banner */}
        <View style={styles.b2bBanner}>
          <View style={styles.bannerContent}>
            <Text style={styles.bannerTitle}>🏭 Direct from Creators & Factories</Text>
            <Text style={styles.bannerSubtitle}>0% Commission • Trade Assurance • Global Sourcing</Text>
          </View>
          <TouchableOpacity style={styles.sourcingButton} onPress={() => router.push('/(tabs)/stories')}>
            <Text style={styles.sourcingButtonText}>Watch Creator Tours</Text>
          </TouchableOpacity>
        </View>

        {/* Trending Industries */}
        <View style={styles.trendingSection}>
          <View style={styles.trendingHeader}>
            <Text style={styles.trendingTitle}>🔥 Trending Industries</Text>
            <Text style={styles.trendingSubtext}>Hot sourcing categories</Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.industryCard}>
              <Image source={{ uri: 'https://via.placeholder.com/120x80/FF7043/white?text=5G+Tech' }} style={styles.industryImage} />
              <Text style={styles.industryName}>5G Electronics</Text>
              <Text style={styles.industrySuppliers}>1,234 suppliers</Text>
            </View>
            <View style={styles.industryCard}>
              <Image source={{ uri: 'https://via.placeholder.com/120x80/66BB6A/white?text=Green+Energy' }} style={styles.industryImage} />
              <Text style={styles.industryName}>Green Energy</Text>
              <Text style={styles.industrySuppliers}>856 suppliers</Text>
            </View>
            <View style={styles.industryCard}>
              <Image source={{ uri: 'https://via.placeholder.com/120x80/42A5F5/white?text=Smart+Home' }} style={styles.industryImage} />
              <Text style={styles.industryName}>Smart Home</Text>
              <Text style={styles.industrySuppliers}>2,187 suppliers</Text>
            </View>
          </ScrollView>
        </View>

        {/* Verified Suppliers */}
        <View style={styles.suppliersSection}>
          <View style={styles.suppliersSectionHeader}>
            <Text style={styles.sectionTitle}>🏆 Verified Suppliers</Text>
            <Text style={styles.sectionSubtitle}>Creator-partnered manufacturers with 0% commission</Text>
          </View>
          <FlatList
            data={suppliers}
            renderItem={renderSupplier}
            keyExtractor={item => item.id}
            numColumns={1}
            scrollEnabled={false}
          />
        </View>

        {/* AisleMarts Creator Factories */}
        <View style={styles.creatorFactoriesSection}>
          <Text style={styles.sectionTitle}>🎬 Creator Factory Tours</Text>
          <Text style={styles.sectionSubtitle}>Behind-the-scenes with verified manufacturers</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {suppliers.slice(0, 3).map((supplier) => (
              <TouchableOpacity key={supplier.id} style={styles.creatorFactoryCard}>
                <Image source={{ uri: supplier.image }} style={styles.creatorFactoryImage} />
                <Text style={styles.creatorFactoryTitle}>{supplier.productName}</Text>
                <Text style={styles.creatorFactoryPartner}>{supplier.creatorPartner}</Text>
                <Text style={styles.creatorFactoryPrice}>{supplier.price}</Text>
                <View style={styles.factoryFeatures}>
                  <Text style={styles.factoryFeature}>🏭 Factory Direct</Text>
                  <Text style={styles.factoryFeature}>✅ Verified</Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Request for Quotation */}
        <View style={styles.rfqSection}>
          <Text style={styles.rfqTitle}>📋 Can't find what you need?</Text>
          <Text style={styles.rfqSubtitle}>Post your requirements and get quotes from suppliers</Text>
          <TouchableOpacity style={styles.postRfqButton}>
            <Text style={styles.postRfqText}>Post Buying Request</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#FF6A00',
    paddingTop: 10,
    paddingBottom: 15,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  menuButton: {
    padding: 10,
  },
  menuIcon: {
    color: '#fff',
    fontSize: 18,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 4,
    marginHorizontal: 10,
    paddingHorizontal: 10,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 16,
  },
  sourceButton: {
    backgroundColor: '#FF6A00',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  sourceText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  rfqButton: {
    padding: 10,
  },
  rfqIcon: {
    color: '#fff',
    fontSize: 18,
  },
  servicesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
  },
  serviceButton: {
    alignItems: 'center',
  },
  serviceIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  serviceText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
  content: {
    flex: 1,
  },
  categoriesSection: {
    backgroundColor: '#fff',
    paddingVertical: 10,
    marginBottom: 2,
  },
  categoriesScroll: {
    paddingHorizontal: 10,
  },
  categoryButton: {
    alignItems: 'center',
    marginRight: 15,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  selectedCategory: {
    backgroundColor: '#FF6A00',
  },
  categoryIcon: {
    fontSize: 16,
    marginBottom: 2,
  },
  categoryText: {
    fontSize: 11,
    color: '#333',
    textAlign: 'center',
  },
  selectedCategoryText: {
    color: '#fff',
  },
  b2bBanner: {
    backgroundColor: '#1565C0',
    margin: 10,
    padding: 15,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  bannerContent: {
    flex: 1,
  },
  bannerTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  bannerSubtitle: {
    color: '#BBDEFB',
    fontSize: 12,
  },
  sourcingButton: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
  },
  sourcingButtonText: {
    color: '#1565C0',
    fontSize: 12,
    fontWeight: '600',
  },
  trendingSection: {
    backgroundColor: '#fff',
    margin: 10,
    marginTop: 0,
    padding: 15,
    borderRadius: 8,
  },
  trendingHeader: {
    marginBottom: 10,
  },
  trendingTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  trendingSubtext: {
    fontSize: 12,
    color: '#666',
  },
  industryCard: {
    marginRight: 12,
    alignItems: 'center',
    width: 100,
  },
  industryImage: {
    width: 80,
    height: 60,
    borderRadius: 6,
    marginBottom: 6,
  },
  industryName: {
    fontSize: 11,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },
  industrySuppliers: {
    fontSize: 10,
    color: '#666',
  },
  suppliersSection: {
    backgroundColor: '#fff',
    margin: 10,
    marginTop: 0,
    padding: 15,
    borderRadius: 8,
  },
  suppliersSectionHeader: {
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 12,
    color: '#666',
  },
  supplierCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  supplierHeader: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 6,
    marginRight: 12,
  },
  supplierBadges: {
    flex: 1,
    justifyContent: 'flex-start',
  },
  factoryBadge: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    marginBottom: 4,
    alignSelf: 'flex-start',
  },
  factoryText: {
    color: '#fff',
    fontSize: 9,
    fontWeight: 'bold',
  },
  tradeAssuranceBadge: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    alignSelf: 'flex-start',
  },
  tradeAssuranceText: {
    color: '#fff',
    fontSize: 9,
    fontWeight: 'bold',
  },
  supplierInfo: {
    flex: 1,
  },
  productTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  companyName: {
    fontSize: 12,
    color: '#666',
    marginBottom: 6,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 4,
  },
  priceRange: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FF6A00',
  },
  priceUnit: {
    fontSize: 12,
    color: '#666',
    marginLeft: 2,
  },
  moqContainer: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  moqLabel: {
    fontSize: 12,
    color: '#666',
  },
  moqValue: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
  },
  aisleMartsFeatures: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  creatorPartner: {
    fontSize: 11,
    color: '#1565C0',
    fontWeight: '600',
  },
  commissionBadge: {
    fontSize: 10,
    color: '#4CAF50',
    fontWeight: '600',
  },
  supplierCredentials: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 4,
  },
  supplierType: {
    fontSize: 10,
    color: '#FF6A00',
    fontWeight: '600',
    marginRight: 8,
  },
  yearsInBusiness: {
    fontSize: 10,
    color: '#666',
    marginRight: 8,
  },
  responseTime: {
    fontSize: 10,
    color: '#4CAF50',
  },
  customization: {
    fontSize: 11,
    color: '#1976D2',
    fontStyle: 'italic',
  },
  creatorFactoriesSection: {
    backgroundColor: '#fff',
    margin: 10,
    marginTop: 0,
    padding: 15,
    borderRadius: 8,
  },
  creatorFactoryCard: {
    width: 140,
    marginRight: 10,
  },
  creatorFactoryImage: {
    width: 130,
    height: 100,
    borderRadius: 6,
    marginBottom: 8,
  },
  creatorFactoryTitle: {
    fontSize: 11,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  creatorFactoryPartner: {
    fontSize: 10,
    color: '#1565C0',
    marginBottom: 4,
  },
  creatorFactoryPrice: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FF6A00',
    marginBottom: 6,
  },
  factoryFeatures: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  factoryFeature: {
    fontSize: 8,
    color: '#4CAF50',
    fontWeight: '600',
  },
  rfqSection: {
    backgroundColor: '#FFF3E0',
    margin: 10,
    marginTop: 0,
    marginBottom: 50,
    padding: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  rfqTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  rfqSubtitle: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginBottom: 15,
  },
  postRfqButton: {
    backgroundColor: '#FF6A00',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
  },
  postRfqText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
});