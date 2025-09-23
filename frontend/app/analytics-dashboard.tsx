import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import TabNavigator from './navigation/TabNavigator';

const { width } = Dimensions.get('window');

interface AnalyticsData {
  totalPoints: number;
  totalSpent: number;
  itemsPurchased: number;
  reviewsWritten: number;
  referralsMade: number;
  streakDays: number;
}

interface CategoryInsight {
  category: string;
  icon: string;
  spent: number;
  items: number;
  percentage: number;
  trend: 'up' | 'down' | 'stable';
}

interface BehaviorInsight {
  id: string;
  title: string;
  description: string;
  icon: string;
  actionable: boolean;
}

export default function AnalyticsDashboardScreen() {
  const router = useRouter();
  const [timeframe, setTimeframe] = useState<'week' | 'month' | 'year'>('month');

  const analyticsData: AnalyticsData = {
    totalPoints: 24680,
    totalSpent: 1847.32,
    itemsPurchased: 67,
    reviewsWritten: 23,
    referralsMade: 8,
    streakDays: 12,
  };

  const categoryInsights: CategoryInsight[] = [
    {
      category: 'Fashion',
      icon: '👗',
      spent: 789.45,
      items: 24,
      percentage: 42.7,
      trend: 'up',
    },
    {
      category: 'Electronics',
      icon: '📱',
      spent: 456.78,
      items: 12,
      percentage: 24.7,
      trend: 'stable',
    },
    {
      category: 'Beauty',
      icon: '💄',
      spent: 234.56,
      items: 18,
      percentage: 12.7,
      trend: 'up',
    },
    {
      category: 'Home & Garden',
      icon: '🏠',
      spent: 189.23,
      items: 8,
      percentage: 10.2,
      trend: 'down',
    },
    {
      category: 'Sports & Fitness',
      icon: '🏃‍♀️',
      spent: 177.30,
      items: 5,
      percentage: 9.6,
      trend: 'up',
    },
  ];

  const behaviorInsights: BehaviorInsight[] = [
    {
      id: '1',
      title: 'Weekend Shopper',
      description: '73% of your purchases happen on weekends. Consider checking weekend flash sales!',
      icon: '📅',
      actionable: true,
    },
    {
      id: '2',
      title: 'Review Champion',
      description: 'You write 2x more reviews than average users. Keep earning those bonus points!',
      icon: '⭐',
      actionable: false,
    },
    {
      id: '3',
      title: 'Fashion Trendsetter',
      description: 'You discover new fashion brands 3 weeks before they trend. Early access available!',
      icon: '🔥',
      actionable: true,
    },
    {
      id: '4',
      title: 'Loyalty Leader',
      description: 'Your 12-day streak puts you in the top 5% of active users.',
      icon: '🏆',
      actionable: false,
    },
  ];

  const monthlyProgress = [
    { month: 'Jan', points: 1200, spent: 145 },
    { month: 'Feb', points: 1800, spent: 201 },
    { month: 'Mar', points: 2100, spent: 187 },
    { month: 'Apr', points: 1950, spent: 234 },
    { month: 'May', points: 2400, spent: 289 },
    { month: 'Jun', points: 2680, spent: 312 },
  ];

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return '📈';
      case 'down': return '📉';
      default: return '➡️';
    }
  };

  const renderOverviewStats = () => (
    <View style={styles.overviewSection}>
      <Text style={styles.sectionTitle}>📊 Your Shopping Overview</Text>
      
      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Text style={styles.statIcon}>⭐</Text>
          <Text style={styles.statNumber}>{analyticsData.totalPoints.toLocaleString()}</Text>
          <Text style={styles.statLabel}>Total Points</Text>
        </View>
        
        <View style={styles.statCard}>
          <Text style={styles.statIcon}>💰</Text>
          <Text style={styles.statNumber}>${analyticsData.totalSpent.toFixed(0)}</Text>
          <Text style={styles.statLabel}>Total Spent</Text>
        </View>
        
        <View style={styles.statCard}>
          <Text style={styles.statIcon}>🛍️</Text>
          <Text style={styles.statNumber}>{analyticsData.itemsPurchased}</Text>
          <Text style={styles.statLabel}>Items Bought</Text>
        </View>
        
        <View style={styles.statCard}>
          <Text style={styles.statIcon}>✍️</Text>
          <Text style={styles.statNumber}>{analyticsData.reviewsWritten}</Text>
          <Text style={styles.statLabel}>Reviews</Text>
        </View>
      </View>

      <View style={styles.secondaryStats}>
        <View style={styles.secondaryStat}>
          <Text style={styles.secondaryIcon}>🔥</Text>
          <Text style={styles.secondaryNumber}>{analyticsData.streakDays}</Text>
          <Text style={styles.secondaryLabel}>Day Streak</Text>
        </View>
        
        <View style={styles.secondaryStat}>
          <Text style={styles.secondaryIcon}>👥</Text>
          <Text style={styles.secondaryNumber}>{analyticsData.referralsMade}</Text>
          <Text style={styles.secondaryLabel}>Referrals</Text>
        </View>
      </View>
    </View>
  );

  const renderCategoryBreakdown = () => (
    <View style={styles.categorySection}>
      <Text style={styles.sectionTitle}>🏷️ Spending by Category</Text>
      
      {categoryInsights.map((category, index) => (
        <View key={category.category} style={styles.categoryCard}>
          <View style={styles.categoryHeader}>
            <View style={styles.categoryLeft}>
              <Text style={styles.categoryIcon}>{category.icon}</Text>
              <View style={styles.categoryInfo}>
                <Text style={styles.categoryName}>{category.category}</Text>
                <Text style={styles.categoryItems}>{category.items} items</Text>
              </View>
            </View>
            
            <View style={styles.categoryRight}>
              <Text style={styles.categoryAmount}>${category.spent.toFixed(0)}</Text>
              <View style={styles.categoryTrend}>
                <Text style={styles.trendIcon}>{getTrendIcon(category.trend)}</Text>
                <Text style={styles.categoryPercentage}>{category.percentage}%</Text>
              </View>
            </View>
          </View>
          
          {/* Progress Bar */}
          <View style={styles.progressBarContainer}>
            <View style={styles.progressBarBackground}>
              <View 
                style={[
                  styles.progressBarFill,
                  { width: `${category.percentage}%` }
                ]} 
              />
            </View>
          </View>
        </View>
      ))}
    </View>
  );

  const renderBehaviorInsights = () => (
    <View style={styles.insightsSection}>
      <Text style={styles.sectionTitle}>🧠 Behavior Insights</Text>
      <Text style={styles.sectionSubtitle}>AI-powered insights about your shopping patterns</Text>
      
      {behaviorInsights.map((insight) => (
        <View key={insight.id} style={styles.insightCard}>
          <View style={styles.insightHeader}>
            <Text style={styles.insightIcon}>{insight.icon}</Text>
            <View style={styles.insightInfo}>
              <Text style={styles.insightTitle}>{insight.title}</Text>
              <Text style={styles.insightDescription}>{insight.description}</Text>
            </View>
            {insight.actionable && (
              <TouchableOpacity style={styles.actionButton}>
                <Text style={styles.actionButtonText}>Act</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      ))}
    </View>
  );

  const renderMonthlyTrends = () => (
    <View style={styles.trendsSection}>
      <Text style={styles.sectionTitle}>📈 Monthly Trends</Text>
      
      <View style={styles.chartContainer}>
        <View style={styles.chartHeader}>
          <Text style={styles.chartTitle}>Points Earned vs Spending</Text>
          <View style={styles.timeframeSelector}>
            {(['week', 'month', 'year'] as const).map((period) => (
              <TouchableOpacity
                key={period}
                style={[
                  styles.timeframeButton,
                  timeframe === period && styles.activeTimeframe
                ]}
                onPress={() => setTimeframe(period)}
              >
                <Text style={[
                  styles.timeframeText,
                  timeframe === period && styles.activeTimeframeText
                ]}>
                  {period.charAt(0).toUpperCase() + period.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        
        {/* Simple Bar Chart */}
        <View style={styles.chartArea}>
          {monthlyProgress.map((data, index) => (
            <View key={data.month} style={styles.chartBar}>
              <View style={styles.barContainer}>
                <View 
                  style={[
                    styles.pointsBar,
                    { height: (data.points / 3000) * 100 }
                  ]} 
                />
                <View 
                  style={[
                    styles.spentBar,
                    { height: (data.spent / 400) * 100 }
                  ]} 
                />
              </View>
              <Text style={styles.barLabel}>{data.month}</Text>
            </View>
          ))}
        </View>
        
        <View style={styles.chartLegend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: '#D4AF37' }]} />
            <Text style={styles.legendText}>Points Earned</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: '#4CAF50' }]} />
            <Text style={styles.legendText}>Amount Spent ($)</Text>
          </View>
        </View>
      </View>
    </View>
  );

  const renderRecommendations = () => (
    <View style={styles.recommendationsSection}>
      <Text style={styles.sectionTitle}>💡 Personalized Recommendations</Text>
      
      <TouchableOpacity style={styles.recommendationCard}>
        <View style={styles.recommendationHeader}>
          <Text style={styles.recommendationIcon}>🎯</Text>
          <View style={styles.recommendationInfo}>
            <Text style={styles.recommendationTitle}>Optimize Your Rewards</Text>
            <Text style={styles.recommendationDescription}>
              You're 250 points away from Gold tier. Complete 2 more reviews to unlock exclusive perks!
            </Text>
          </View>
        </View>
        <View style={styles.recommendationAction}>
          <Text style={styles.actionText}>Take Action</Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity style={styles.recommendationCard}>
        <View style={styles.recommendationHeader}>
          <Text style={styles.recommendationIcon}>📱</Text>
          <View style={styles.recommendationInfo}>
            <Text style={styles.recommendationTitle}>Smart Spending Alert</Text>
            <Text style={styles.recommendationDescription}>
              Electronics deals peak on Tuesdays. Set a reminder to check deals tomorrow!
            </Text>
          </View>
        </View>
        <View style={styles.recommendationAction}>
          <Text style={styles.actionText}>Set Reminder</Text>
        </View>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      <SafeAreaView style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.backButton}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Analytics</Text>
          <TouchableOpacity onPress={() => router.push('/export-data')}>
            <Text style={styles.exportButton}>📤</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {renderOverviewStats()}
        {renderCategoryBreakdown()}
        {renderMonthlyTrends()}
        {renderBehaviorInsights()}
        {renderRecommendations()}
        
        <View style={styles.bottomSpacing} />
      </ScrollView>

      <TabNavigator />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    backgroundColor: '#000000',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(212, 175, 55, 0.3)',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backButton: {
    fontSize: 24,
    color: '#FFFFFF',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  exportButton: {
    fontSize: 20,
  },
  content: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#CCCCCC',
    marginBottom: 16,
    lineHeight: 20,
  },
  // Overview Stats
  overviewSection: {
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statCard: {
    width: '48%',
    backgroundColor: 'rgba(212, 175, 55, 0.05)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.2)',
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  statIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '700',
    color: '#D4AF37',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#CCCCCC',
    textAlign: 'center',
  },
  secondaryStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  secondaryStat: {
    alignItems: 'center',
  },
  secondaryIcon: {
    fontSize: 20,
    marginBottom: 6,
  },
  secondaryNumber: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  secondaryLabel: {
    fontSize: 12,
    color: '#CCCCCC',
  },
  // Category Breakdown
  categorySection: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  categoryCard: {
    backgroundColor: 'rgba(212, 175, 55, 0.05)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.2)',
    padding: 16,
    marginBottom: 12,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  categoryIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  categoryInfo: {
    flex: 1,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  categoryItems: {
    fontSize: 12,
    color: '#CCCCCC',
  },
  categoryRight: {
    alignItems: 'flex-end',
  },
  categoryAmount: {
    fontSize: 16,
    fontWeight: '700',
    color: '#D4AF37',
    marginBottom: 4,
  },
  categoryTrend: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  trendIcon: {
    fontSize: 12,
    marginRight: 4,
  },
  categoryPercentage: {
    fontSize: 12,
    color: '#CCCCCC',
    fontWeight: '600',
  },
  progressBarContainer: {
    height: 6,
  },
  progressBarBackground: {
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 3,
  },
  progressBarFill: {
    height: 6,
    backgroundColor: '#D4AF37',
    borderRadius: 3,
  },
  // Trends
  trendsSection: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  chartContainer: {
    backgroundColor: 'rgba(212, 175, 55, 0.05)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.2)',
    padding: 16,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  timeframeSelector: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 6,
    padding: 2,
  },
  timeframeButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  activeTimeframe: {
    backgroundColor: '#D4AF37',
  },
  timeframeText: {
    fontSize: 10,
    color: '#CCCCCC',
    fontWeight: '600',
  },
  activeTimeframeText: {
    color: '#000000',
  },
  chartArea: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 120,
    marginBottom: 12,
  },
  chartBar: {
    alignItems: 'center',
    flex: 1,
  },
  barContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 100,
    marginBottom: 8,
  },
  pointsBar: {
    width: 8,
    backgroundColor: '#D4AF37',
    borderRadius: 4,
    marginRight: 2,
  },
  spentBar: {
    width: 8,
    backgroundColor: '#4CAF50',
    borderRadius: 4,
  },
  barLabel: {
    fontSize: 10,
    color: '#CCCCCC',
    fontWeight: '600',
  },
  chartLegend: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 12,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 6,
  },
  legendText: {
    fontSize: 12,
    color: '#CCCCCC',
  },
  // Insights
  insightsSection: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  insightCard: {
    backgroundColor: 'rgba(212, 175, 55, 0.05)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.2)',
    padding: 16,
    marginBottom: 12,
  },
  insightHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  insightIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  insightInfo: {
    flex: 1,
  },
  insightTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 6,
  },
  insightDescription: {
    fontSize: 14,
    color: '#CCCCCC',
    lineHeight: 20,
  },
  actionButton: {
    backgroundColor: 'rgba(212, 175, 55, 0.2)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D4AF37',
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#D4AF37',
  },
  // Recommendations
  recommendationsSection: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  recommendationCard: {
    backgroundColor: 'rgba(212, 175, 55, 0.05)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.2)',
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  recommendationHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
  },
  recommendationIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  recommendationInfo: {
    flex: 1,
  },
  recommendationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 6,
  },
  recommendationDescription: {
    fontSize: 14,
    color: '#CCCCCC',
    lineHeight: 20,
  },
  recommendationAction: {
    backgroundColor: '#D4AF37',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  actionText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#000000',
  },
  bottomSpacing: {
    height: 100,
  },
});