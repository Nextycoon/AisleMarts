import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Alert,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

interface User {
  id: string;
  email: string;
  role: string;
  created_at: string;
}

export default function NewChatScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    searchUsers();
  }, [searchQuery]);

  const searchUsers = async () => {
    if (searchQuery.length < 2) {
      setUsers([]);
      return;
    }

    setLoading(true);
    try {
      // For demo purposes, we'll use mock users
      // In production, implement user search API
      const mockUsers: User[] = [
        { id: '1', email: 'alice@example.com', role: 'buyer', created_at: new Date().toISOString() },
        { id: '2', email: 'bob@example.com', role: 'seller', created_at: new Date().toISOString() },
        { id: '3', email: 'creator@example.com', role: 'creator', created_at: new Date().toISOString() },
        { id: '4', email: 'vendor@example.com', role: 'vendor', created_at: new Date().toISOString() },
      ].filter(user => 
        user.email.toLowerCase().includes(searchQuery.toLowerCase())
      );

      setUsers(mockUsers);
    } catch (error) {
      console.error('Error searching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleUserSelection = (user: User) => {
    setSelectedUsers(prev => {
      const isSelected = prev.find(u => u.id === user.id);
      if (isSelected) {
        return prev.filter(u => u.id !== user.id);
      } else {
        return [...prev, user];
      }
    });
  };

  const createConversation = async () => {
    if (selectedUsers.length === 0) {
      Alert.alert('Error', 'Please select at least one user');
      return;
    }

    setCreating(true);
    try {
      const backendUrl = process.env.EXPO_PUBLIC_BACKEND_URL || '';
      const response = await fetch(`${backendUrl}/api/dm/conversations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          participants: selectedUsers.map(u => u.id),
          title: selectedUsers.length > 1 ? `Group Chat` : undefined,
          channel_type: selectedUsers.length > 1 ? 'group' : 'direct'
        })
      });

      if (response.ok) {
        const conversation = await response.json();
        router.replace(`/chat/${conversation.id}`);
      } else {
        throw new Error('Failed to create conversation');
      }
    } catch (error) {
      console.error('Error creating conversation:', error);
      Alert.alert('Error', 'Failed to create conversation');
    } finally {
      setCreating(false);
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'creator': return 'star';
      case 'vendor': return 'storefront';
      case 'seller': return 'business';
      default: return 'person';
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'creator': return '#D4AF37';
      case 'vendor': return '#8A2BE2';
      case 'seller': return '#4169E1';
      default: return '#FFFFFF';
    }
  };

  const renderUser = ({ item }: { item: User }) => {
    const isSelected = selectedUsers.find(u => u.id === item.id);
    
    return (
      <TouchableOpacity
        style={[styles.userItem, isSelected && styles.selectedUserItem]}
        onPress={() => toggleUserSelection(item)}
        activeOpacity={0.7}
      >
        <View style={[styles.userAvatar, { borderColor: getRoleColor(item.role) }]}>
          <Ionicons 
            name={getRoleIcon(item.role)} 
            size={20} 
            color={getRoleColor(item.role)} 
          />
        </View>
        
        <View style={styles.userInfo}>
          <Text style={styles.userEmail}>{item.email}</Text>
          <Text style={[styles.userRole, { color: getRoleColor(item.role) }]}>
            {item.role.charAt(0).toUpperCase() + item.role.slice(1)}
          </Text>
        </View>
        
        <View style={[styles.checkbox, isSelected && styles.checkedBox]}>
          {isSelected && <Ionicons name="checkmark" size={16} color="#000000" />}
        </View>
      </TouchableOpacity>
    );
  };

  const renderSelectedUser = ({ item }: { item: User }) => (
    <TouchableOpacity
      style={styles.selectedUserChip}
      onPress={() => toggleUserSelection(item)}
    >
      <Text style={styles.selectedUserText}>{item.email}</Text>
      <Ionicons name="close" size={16} color="#000000" />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#D4AF37" />
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>New Chat</Text>
        
        <TouchableOpacity
          style={[styles.createButton, { opacity: selectedUsers.length > 0 ? 1 : 0.5 }]}
          onPress={createConversation}
          disabled={selectedUsers.length === 0 || creating}
        >
          <Text style={styles.createButtonText}>
            {creating ? 'Creating...' : 'Create'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search users by email..."
          placeholderTextColor="#666"
          autoCapitalize="none"
          autoCorrect={false}
        />
      </View>

      {/* Selected Users */}
      {selectedUsers.length > 0 && (
        <View style={styles.selectedUsersContainer}>
          <Text style={styles.selectedUsersTitle}>Selected ({selectedUsers.length})</Text>
          <FlatList
            data={selectedUsers}
            renderItem={renderSelectedUser}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.selectedUsersList}
          />
        </View>
      )}

      {/* Users List */}
      <FlatList
        data={users}
        renderItem={renderUser}
        keyExtractor={(item) => item.id}
        style={styles.usersList}
        contentContainerStyle={users.length === 0 ? styles.emptyContainer : undefined}
        ListEmptyComponent={
          searchQuery.length >= 2 ? (
            <View style={styles.emptyState}>
              <Ionicons name="search" size={64} color="#666" />
              <Text style={styles.emptyTitle}>No users found</Text>
              <Text style={styles.emptySubtitle}>
                Try searching with a different email address
              </Text>
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="people" size={64} color="#666" />
              <Text style={styles.emptyTitle}>Search for users</Text>
              <Text style={styles.emptySubtitle}>
                Enter at least 2 characters to search for users
              </Text>
            </View>
          )
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '600',
  },
  createButton: {
    backgroundColor: '#D4AF37',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  createButtonText: {
    color: '#000000',
    fontSize: 14,
    fontWeight: '600',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginHorizontal: 20,
    marginVertical: 16,
    borderRadius: 12,
    paddingHorizontal: 16,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 16,
    paddingVertical: 12,
  },
  selectedUsersContainer: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  selectedUsersTitle: {
    color: '#D4AF37',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  selectedUsersList: {
    flexGrow: 1,
  },
  selectedUserChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D4AF37',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
  },
  selectedUserText: {
    color: '#000000',
    fontSize: 12,
    fontWeight: '500',
    marginRight: 4,
  },
  usersList: {
    flex: 1,
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    marginHorizontal: 20,
    marginVertical: 4,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  selectedUserItem: {
    borderColor: '#D4AF37',
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  userInfo: {
    flex: 1,
  },
  userEmail: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
  userRole: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#666',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkedBox: {
    backgroundColor: '#D4AF37',
    borderColor: '#D4AF37',
  },
  emptyContainer: {
    flex: 1,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    color: '#999',
    fontSize: 14,
    textAlign: 'center',
  },
});