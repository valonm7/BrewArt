import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

import { ThemedText } from '@/components/ThemedText';

// Sample loyalty stats data
const loyaltyStats = {
  totalMembers: 386,
  activeMembersLast30Days: 245,
  pointsIssued: 18450,
  pointsRedeemed: 12350,
  totalRedemptions: 98,
  tierBreakdown: {
    bronze: 230,
    silver: 124,
    gold: 32,
  },
  popularRedemptions: [
    { id: '1', name: 'Free Coffee', count: 42 },
    { id: '2', name: 'Pastry of Choice', count: 25 },
    { id: '3', name: '50% Off Any Drink', count: 18 },
    { id: '4', name: 'Free Add-in', count: 13 },
  ],
  monthlyStats: [
    { month: 'Jan', members: 310, pointsIssued: 10250, pointsRedeemed: 8120 },
    { month: 'Feb', members: 325, pointsIssued: 11450, pointsRedeemed: 9350 },
    { month: 'Mar', members: 340, pointsIssued: 12750, pointsRedeemed: 10220 },
    { month: 'Apr', members: 355, pointsIssued: 14250, pointsRedeemed: 11150 },
    { month: 'May', members: 370, pointsIssued: 16350, pointsRedeemed: 11850 },
    { month: 'Jun', members: 386, pointsIssued: 18450, pointsRedeemed: 12350 },
  ],
};

export default function AdminLoyaltyScreen() {
  const [timeFrame, setTimeFrame] = useState('month'); // 'week', 'month', 'year'
  const router = useRouter();
  
  // Get formatted percentage for tier breakdown
  const getTierPercentage = (tier: 'bronze' | 'silver' | 'gold') => {
    const count = loyaltyStats.tierBreakdown[tier];
    const total = loyaltyStats.totalMembers;
    const percentage = (count / total) * 100;
    return percentage.toFixed(1) + '%';
  };
  
  // Get formatted percentage for tier breakdown as a number (for styling)
  const getTierPercentageValue = (tier: 'bronze' | 'silver' | 'gold') => {
    const count = loyaltyStats.tierBreakdown[tier];
    const total = loyaltyStats.totalMembers;
    return Math.min(100, (count / total) * 100);
  };
  
  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{
          title: 'Loyalty Analytics',
          headerStyle: { backgroundColor: '#F4EDE4' },
          headerTintColor: '#3C2A15',
        }} 
      />
      
      <View style={styles.timeFrameContainer}>
        <TouchableOpacity 
          style={[styles.timeFrameButton, timeFrame === 'week' && styles.activeTimeFrame]}
          onPress={() => setTimeFrame('week')}
        >
          <ThemedText style={[styles.timeFrameText, timeFrame === 'week' && styles.activeTimeFrameText]}>
            Week
          </ThemedText>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.timeFrameButton, timeFrame === 'month' && styles.activeTimeFrame]}
          onPress={() => setTimeFrame('month')}
        >
          <ThemedText style={[styles.timeFrameText, timeFrame === 'month' && styles.activeTimeFrameText]}>
            Month
          </ThemedText>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.timeFrameButton, timeFrame === 'year' && styles.activeTimeFrame]}
          onPress={() => setTimeFrame('year')}
        >
          <ThemedText style={[styles.timeFrameText, timeFrame === 'year' && styles.activeTimeFrameText]}>
            Year
          </ThemedText>
        </TouchableOpacity>
      </View>
      
      <ScrollView style={styles.content}>
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <View style={styles.statIconContainer}>
              <Ionicons name="people" size={24} color="#8E6E53" />
            </View>
            <ThemedText style={styles.statValue}>{loyaltyStats.totalMembers}</ThemedText>
            <ThemedText style={styles.statLabel}>Total Members</ThemedText>
          </View>
          
          <View style={styles.statCard}>
            <View style={styles.statIconContainer}>
              <Ionicons name="person-add" size={24} color="#8E6E53" />
            </View>
            <ThemedText style={styles.statValue}>{loyaltyStats.activeMembersLast30Days}</ThemedText>
            <ThemedText style={styles.statLabel}>Active Members (30d)</ThemedText>
          </View>
          
          <View style={styles.statCard}>
            <View style={styles.statIconContainer}>
              <Ionicons name="gift" size={24} color="#8E6E53" />
            </View>
            <ThemedText style={styles.statValue}>{loyaltyStats.totalRedemptions}</ThemedText>
            <ThemedText style={styles.statLabel}>Total Redemptions</ThemedText>
          </View>
          
          <View style={styles.statCard}>
            <View style={styles.statIconContainer}>
              <Ionicons name="trending-up" size={24} color="#8E6E53" />
            </View>
            <ThemedText style={styles.statValue}>
              {((loyaltyStats.activeMembersLast30Days / loyaltyStats.totalMembers) * 100).toFixed(1)}%
            </ThemedText>
            <ThemedText style={styles.statLabel}>Engagement Rate</ThemedText>
          </View>
        </View>
        
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Member Tier Breakdown</ThemedText>
          <View style={styles.tierBreakdownContainer}>
            <View style={styles.tierItem}>
              <View style={styles.tierBar}>
                <View 
                  style={[
                    styles.tierBarFill, 
                    { backgroundColor: '#CD7F32', width: `${getTierPercentageValue('bronze')}%` }
                  ]} 
                />
              </View>
              <View style={styles.tierInfoContainer}>
                <View style={[styles.tierDot, { backgroundColor: '#CD7F32' }]} />
                <ThemedText style={styles.tierLabel}>Bronze Members</ThemedText>
                <ThemedText style={styles.tierCount}>{loyaltyStats.tierBreakdown.bronze}</ThemedText>
                <ThemedText style={styles.tierPercentage}>{getTierPercentage('bronze')}</ThemedText>
              </View>
            </View>
            
            <View style={styles.tierItem}>
              <View style={styles.tierBar}>
                <View 
                  style={[
                    styles.tierBarFill, 
                    { backgroundColor: '#C0C0C0', width: `${getTierPercentageValue('silver')}%` }
                  ]} 
                />
              </View>
              <View style={styles.tierInfoContainer}>
                <View style={[styles.tierDot, { backgroundColor: '#C0C0C0' }]} />
                <ThemedText style={styles.tierLabel}>Silver Members</ThemedText>
                <ThemedText style={styles.tierCount}>{loyaltyStats.tierBreakdown.silver}</ThemedText>
                <ThemedText style={styles.tierPercentage}>{getTierPercentage('silver')}</ThemedText>
              </View>
            </View>
            
            <View style={styles.tierItem}>
              <View style={styles.tierBar}>
                <View 
                  style={[
                    styles.tierBarFill, 
                    { backgroundColor: '#FFD700', width: `${getTierPercentageValue('gold')}%` }
                  ]} 
                />
              </View>
              <View style={styles.tierInfoContainer}>
                <View style={[styles.tierDot, { backgroundColor: '#FFD700' }]} />
                <ThemedText style={styles.tierLabel}>Gold Members</ThemedText>
                <ThemedText style={styles.tierCount}>{loyaltyStats.tierBreakdown.gold}</ThemedText>
                <ThemedText style={styles.tierPercentage}>{getTierPercentage('gold')}</ThemedText>
              </View>
            </View>
          </View>
        </View>
        
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Points Overview</ThemedText>
          <View style={styles.pointsOverviewCard}>
            <View style={styles.pointsOverviewItem}>
              <ThemedText style={styles.pointsOverviewLabel}>Points Issued</ThemedText>
              <ThemedText style={styles.pointsOverviewValue}>{loyaltyStats.pointsIssued}</ThemedText>
            </View>
            
            <View style={styles.pointsDivider} />
            
            <View style={styles.pointsOverviewItem}>
              <ThemedText style={styles.pointsOverviewLabel}>Points Redeemed</ThemedText>
              <ThemedText style={styles.pointsOverviewValue}>{loyaltyStats.pointsRedeemed}</ThemedText>
            </View>
          </View>
        </View>
        
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Popular Redemptions</ThemedText>
          <View style={styles.popularRedemptionsContainer}>
            {loyaltyStats.popularRedemptions.map((item, index) => (
              <View key={item.id} style={[
                styles.redemptionItem,
                index === loyaltyStats.popularRedemptions.length - 1 && { borderBottomWidth: 0 }
              ]}>
                <View style={styles.redemptionRank}>
                  <ThemedText style={styles.redemptionRankText}>{index + 1}</ThemedText>
                </View>
                <ThemedText style={styles.redemptionName}>{item.name}</ThemedText>
                <ThemedText style={styles.redemptionCount}>{item.count} times</ThemedText>
              </View>
            ))}
          </View>
        </View>
        
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Monthly Trends</ThemedText>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false} 
            style={styles.trendsScrollView}
          >
            <View style={styles.trendsContainer}>
              {loyaltyStats.monthlyStats.map((month) => {
                const maxPoints = Math.max(...loyaltyStats.monthlyStats.map(m => m.pointsIssued));
                const issuedHeight = Math.floor((month.pointsIssued / maxPoints) * 100);
                const redeemedHeight = Math.floor((month.pointsRedeemed / maxPoints) * 100);
                
                return (
                  <View key={month.month} style={styles.monthTrendItem}>
                    <ThemedText style={styles.memberCountText}>{month.members}</ThemedText>
                    <View style={styles.trendBar}>
                      <View style={[styles.trendBarFill, styles.issuedBar, { height: `${issuedHeight}%` }]} />
                      <View style={[styles.trendBarFill, styles.redeemedBar, { height: `${redeemedHeight}%` }]} />
                    </View>
                    <ThemedText style={styles.monthLabel}>{month.month}</ThemedText>
                  </View>
                );
              })}
            </View>
          </ScrollView>
          
          <View style={styles.trendLegend}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#8E6E53' }]} />
              <ThemedText style={styles.legendText}>Points Issued</ThemedText>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#B5A99A' }]} />
              <ThemedText style={styles.legendText}>Points Redeemed</ThemedText>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFCF7',
  },
  timeFrameContainer: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: '#F4EDE4',
    justifyContent: 'center',
  },
  timeFrameButton: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    marginHorizontal: 4,
    borderRadius: 20,
    backgroundColor: 'transparent',
  },
  activeTimeFrame: {
    backgroundColor: '#FFFFFF',
  },
  timeFrameText: {
    fontSize: 14,
    color: '#8E6E53',
  },
  activeTimeFrameText: {
    fontWeight: '600',
    color: '#3C2A15',
  },
  content: {
    flex: 1,
    paddingVertical: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  statCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    margin: '1%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F4EDE4',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#3C2A15',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#8E6E53',
    textAlign: 'center',
  },
  section: {
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#3C2A15',
    marginBottom: 16,
  },
  tierBreakdownContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  tierItem: {
    marginBottom: 16,
  },
  tierBar: {
    height: 8,
    backgroundColor: '#F4EDE4',
    borderRadius: 4,
    marginBottom: 8,
  },
  tierBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  tierInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tierDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  tierLabel: {
    fontSize: 14,
    color: '#3C2A15',
    flex: 1,
  },
  tierCount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3C2A15',
    marginRight: 8,
  },
  tierPercentage: {
    fontSize: 14,
    color: '#8E6E53',
    width: 60,
    textAlign: 'right',
  },
  pointsOverviewCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  pointsOverviewItem: {
    flex: 1,
    alignItems: 'center',
  },
  pointsDivider: {
    width: 1,
    backgroundColor: '#F0F0F0',
    marginHorizontal: 8,
  },
  pointsOverviewLabel: {
    fontSize: 14,
    color: '#8E6E53',
    marginBottom: 8,
    textAlign: 'center',
  },
  pointsOverviewValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#3C2A15',
  },
  popularRedemptionsContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  redemptionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  redemptionRank: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F4EDE4',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  redemptionRankText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#8E6E53',
  },
  redemptionName: {
    fontSize: 16,
    color: '#3C2A15',
    flex: 1,
  },
  redemptionCount: {
    fontSize: 14,
    color: '#8E6E53',
  },
  trendsScrollView: {
    marginBottom: 16,
  },
  trendsContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 200,
    minWidth: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  monthTrendItem: {
    alignItems: 'center',
    marginHorizontal: 12,
    height: '100%',
    justifyContent: 'flex-end',
  },
  monthLabel: {
    fontSize: 12,
    color: '#8E6E53',
    marginTop: 8,
  },
  trendBar: {
    width: 20,
    height: 120,
    backgroundColor: '#F4EDE4',
    borderRadius: 4,
    position: 'relative',
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  trendBarFill: {
    width: '100%',
    position: 'absolute',
    bottom: 0,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },
  issuedBar: {
    backgroundColor: '#8E6E53',
    zIndex: 2,
  },
  redeemedBar: {
    backgroundColor: '#B5A99A',
    zIndex: 1,
  },
  memberCountText: {
    fontSize: 10,
    color: '#8E6E53',
    marginBottom: 4,
  },
  trendLegend: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 12,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  legendText: {
    fontSize: 12,
    color: '#8E6E53',
  },
}); 