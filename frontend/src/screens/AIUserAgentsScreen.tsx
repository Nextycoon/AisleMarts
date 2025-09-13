import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { aiUserAgentsService, AgentConfiguration, AgentTask, CreateAgentConfigRequest, CreateTaskRequest } from '../services/AIUserAgentsService';

const AIUserAgentsScreen = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(false);
  const [agentConfig, setAgentConfig] = useState<AgentConfiguration | null>(null);
  const [tasks, setTasks] = useState<AgentTask[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);

  // Configuration form
  const [configForm, setConfigForm] = useState<CreateAgentConfigRequest>({
    agent_role: 'buyer_agent',
    tasks_enabled: ['shopping.discover_products', 'logistics.estimate'],
    priority_rules: ['cost', 'reliability'],
    interest_tags: ['electronics', 'fashion'],
    agent_style: 'friendly',
    default_mode: 'semi_auto',
    spend_limits: { daily: 100, monthly: 1000 },
    learning_enabled: true,
    privacy_mode: false
  });

  // Task creation form
  const [taskForm, setTaskForm] = useState<CreateTaskRequest>({
    task_type: 'shopping.discover_products',
    task_name: '',
    description: '',
    mode: 'manual',
    parameters: {}
  });

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      const [config, userTasks, agentAnalytics] = await Promise.all([
        aiUserAgentsService.getAgentConfiguration().catch(() => null),
        aiUserAgentsService.getUserTasks().catch(() => ({ tasks: [] })),
        aiUserAgentsService.getAgentAnalytics().catch(() => null)
      ]);

      setAgentConfig(config);
      setTasks(userTasks.tasks || []);
      setAnalytics(agentAnalytics);
    } catch (error) {
      console.error('Error loading initial data:', error);
    }
  };

  const handleCreateAgentConfig = async () => {
    if (!configForm.agent_role) {
      Alert.alert('Error', 'Please select an agent role');
      return;
    }

    setLoading(true);
    try {
      const result = await aiUserAgentsService.createAgentConfiguration(configForm);
      Alert.alert('Success', 'AI Agent configuration created successfully!');
      await loadInitialData();
    } catch (error) {
      Alert.alert('Error', 'Failed to create agent configuration');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async () => {
    if (!taskForm.task_name.trim() || !taskForm.description.trim()) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      const result = await aiUserAgentsService.createTask(taskForm);
      Alert.alert('Success', 'Task created successfully!');
      await loadInitialData();
      setTaskForm({
        task_type: 'shopping.discover_products',
        task_name: '',
        description: '',
        mode: 'manual',
        parameters: {}
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to create task');
    } finally {
      setLoading(false);
    }
  };

  const handleTaskAction = async (taskId: string, action: 'approve' | 'reject' | 'cancel') => {
    setLoading(true);
    try {
      await aiUserAgentsService.performTaskAction({ task_id: taskId, action });
      Alert.alert('Success', `Task ${action}d successfully!`);
      await loadInitialData();
    } catch (error) {
      Alert.alert('Error', `Failed to ${action} task`);
    } finally {
      setLoading(false);
    }
  };

  const renderTabButton = (tabId: string, title: string, icon: string) => (
    <TouchableOpacity
      style={[styles.tabButton, activeTab === tabId && styles.activeTab]}
      onPress={() => setActiveTab(tabId)}
    >
      <Ionicons name={icon as any} size={20} color={activeTab === tabId ? '#007AFF' : '#666'} />
      <Text style={[styles.tabText, activeTab === tabId && styles.activeTabText]}>{title}</Text>
    </TouchableOpacity>
  );

  const renderDashboardTab = () => (
    <View style={styles.tabContent}>
      <Text style={styles.tabTitle}>🤖 AI Agent Dashboard</Text>
      <Text style={styles.tabSubtitle}>Your personal AI assistant overview</Text>

      {agentConfig ? (
        <View style={styles.agentOverview}>
          <View style={styles.agentCard}>
            <View style={styles.agentHeader}>
              <View style={styles.agentInfo}>
                <Text style={styles.agentRole}>
                  {agentConfig.agent_role === 'buyer_agent' ? '🛍️ Buyer Agent' : '🏢 Brand Agent'}
                </Text>
                <Text style={styles.agentStyle}>Style: {agentConfig.agent_style}</Text>
              </View>
              <View style={styles.agentMode}>
                <Text style={styles.modeLabel}>Mode</Text>
                <Text style={styles.modeValue}>{agentConfig.default_mode.replace('_', ' ')}</Text>
              </View>
            </View>
            
            <View style={styles.agentDetails}>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Enabled Tasks:</Text>
                <Text style={styles.detailValue}>{agentConfig.tasks_enabled.length}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Daily Limit:</Text>
                <Text style={styles.detailValue}>${agentConfig.spend_limits.daily}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Learning:</Text>
                <Text style={styles.detailValue}>{agentConfig.learning_enabled ? 'Enabled' : 'Disabled'}</Text>
              </View>
            </View>
          </View>

          {analytics && (
            <View style={styles.analyticsCard}>
              <Text style={styles.analyticsTitle}>📊 Performance Analytics</Text>
              <View style={styles.analyticsGrid}>
                <View style={styles.analyticsItem}>
                  <Text style={styles.analyticsValue}>{analytics.total_tasks || 0}</Text>
                  <Text style={styles.analyticsLabel}>Total Tasks</Text>
                </View>
                <View style={styles.analyticsItem}>
                  <Text style={styles.analyticsValue}>{analytics.completed_tasks || 0}</Text>
                  <Text style={styles.analyticsLabel}>Completed</Text>
                </View>
                <View style={styles.analyticsItem}>
                  <Text style={styles.analyticsValue}>{Math.round((analytics.success_rate || 0) * 100)}%</Text>
                  <Text style={styles.analyticsLabel}>Success Rate</Text>
                </View>
                <View style={styles.analyticsItem}>
                  <Text style={styles.analyticsValue}>${Math.round(analytics.cost_saved_estimate || 0)}</Text>
                  <Text style={styles.analyticsLabel}>Saved</Text>
                </View>
              </View>
            </View>
          )}

          <View style={styles.recentTasks}>
            <Text style={styles.recentTasksTitle}>📋 Recent Tasks</Text>
            {tasks.slice(0, 3).map((task) => (
              <View key={task._id} style={styles.taskCard}>
                <View style={styles.taskHeader}>
                  <Text style={styles.taskName}>{task.task_name}</Text>
                  <View style={[styles.statusBadge, getStatusStyle(task.status)]}>
                    <Text style={styles.statusText}>{task.status}</Text>
                  </View>
                </View>
                <Text style={styles.taskDescription}>{task.description}</Text>
                <Text style={styles.taskDate}>
                  Created: {new Date(task.created_at).toLocaleDateString()}
                </Text>
              </View>
            ))}
            {tasks.length === 0 && (
              <Text style={styles.noTasksText}>No tasks yet. Create your first task!</Text>
            )}
          </View>
        </View>
      ) : (
        <View style={styles.noAgentCard}>
          <Ionicons name="robot" size={64} color="#ccc" />
          <Text style={styles.noAgentTitle}>No AI Agent Configured</Text>
          <Text style={styles.noAgentText}>Set up your personal AI assistant to get started</Text>
          <TouchableOpacity 
            style={styles.setupButton}
            onPress={() => setActiveTab('config')}
          >
            <Text style={styles.setupButtonText}>Setup AI Agent</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  const renderConfigTab = () => (
    <View style={styles.tabContent}>
      <Text style={styles.tabTitle}>⚙️ Agent Configuration</Text>
      <Text style={styles.tabSubtitle}>Customize your AI assistant's behavior</Text>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Agent Role</Text>
        <View style={styles.roleButtons}>
          {[
            { key: 'buyer_agent', label: '🛍️ Buyer Agent', desc: 'For shopping and purchasing' },
            { key: 'brand_agent', label: '🏢 Brand Agent', desc: 'For business and selling' }
          ].map(role => (
            <TouchableOpacity
              key={role.key}
              style={[styles.roleButton, configForm.agent_role === role.key && styles.activeRoleButton]}
              onPress={() => setConfigForm({...configForm, agent_role: role.key as any})}
            >
              <Text style={[styles.roleButtonText, configForm.agent_role === role.key && styles.activeRoleButtonText]}>
                {role.label}
              </Text>
              <Text style={[styles.roleButtonDesc, configForm.agent_role === role.key && styles.activeRoleButtonDesc]}>
                {role.desc}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Agent Style</Text>
        <View style={styles.styleButtons}>
          {['formal', 'concise', 'friendly', 'data_driven'].map(style => (
            <TouchableOpacity
              key={style}
              style={[styles.styleButton, configForm.agent_style === style && styles.activeStyleButton]}
              onPress={() => setConfigForm({...configForm, agent_style: style as any})}
            >
              <Text style={[styles.styleButtonText, configForm.agent_style === style && styles.activeStyleButtonText]}>
                {style.replace('_', ' ').charAt(0).toUpperCase() + style.replace('_', ' ').slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Default Mode</Text>
        <View style={styles.modeButtons}>
          {[
            { key: 'manual', label: 'Manual', desc: 'Ask before every action' },
            { key: 'semi_auto', label: 'Semi-Auto', desc: 'Propose actions for approval' },
            { key: 'auto', label: 'Auto', desc: 'Execute simple tasks automatically' }
          ].map(mode => (
            <TouchableOpacity
              key={mode.key}
              style={[styles.modeButton, configForm.default_mode === mode.key && styles.activeModeButton]}
              onPress={() => setConfigForm({...configForm, default_mode: mode.key as any})}
            >
              <Text style={[styles.modeButtonText, configForm.default_mode === mode.key && styles.activeModeButtonText]}>
                {mode.label}
              </Text>
              <Text style={[styles.modeButtonDesc, configForm.default_mode === mode.key && styles.activeModeButtonDesc]}>
                {mode.desc}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.row}>
        <View style={[styles.inputGroup, {flex: 1, marginRight: 8}]}>
          <Text style={styles.label}>Daily Limit ($)</Text>
          <TextInput
            style={styles.input}
            value={configForm.spend_limits.daily.toString()}
            onChangeText={(text) => setConfigForm({
              ...configForm, 
              spend_limits: {...configForm.spend_limits, daily: parseFloat(text) || 0}
            })}
            placeholder="100"
            keyboardType="numeric"
          />
        </View>
        
        <View style={[styles.inputGroup, {flex: 1, marginLeft: 8}]}>
          <Text style={styles.label}>Monthly Limit ($)</Text>
          <TextInput
            style={styles.input}
            value={configForm.spend_limits.monthly.toString()}
            onChangeText={(text) => setConfigForm({
              ...configForm, 
              spend_limits: {...configForm.spend_limits, monthly: parseFloat(text) || 0}
            })}
            placeholder="1000"
            keyboardType="numeric"
          />
        </View>
      </View>

      <View style={styles.switchGroup}>
        <View style={styles.switchRow}>
          <Text style={styles.switchLabel}>Learning Enabled</Text>
          <TouchableOpacity
            style={[styles.switch, configForm.learning_enabled && styles.switchActive]}
            onPress={() => setConfigForm({...configForm, learning_enabled: !configForm.learning_enabled})}
          >
            <View style={[styles.switchThumb, configForm.learning_enabled && styles.switchThumbActive]} />
          </TouchableOpacity>
        </View>
        
        <View style={styles.switchRow}>
          <Text style={styles.switchLabel}>Privacy Mode</Text>
          <TouchableOpacity
            style={[styles.switch, configForm.privacy_mode && styles.switchActive]}
            onPress={() => setConfigForm({...configForm, privacy_mode: !configForm.privacy_mode})}
          >
            <View style={[styles.switchThumb, configForm.privacy_mode && styles.switchThumbActive]} />
          </TouchableOpacity>
        </View>
      </View>

      <TouchableOpacity style={styles.submitButton} onPress={handleCreateAgentConfig} disabled={loading}>
        {loading ? <ActivityIndicator color="white" /> : (
          <>
            <Ionicons name="save" size={20} color="white" />
            <Text style={styles.submitButtonText}>
              {agentConfig ? 'Update Configuration' : 'Create AI Agent'}
            </Text>
          </>
        )}
      </TouchableOpacity>
    </View>
  );

  const renderTasksTab = () => (
    <View style={styles.tabContent}>
      <Text style={styles.tabTitle}>📋 Task Management</Text>
      <Text style={styles.tabSubtitle}>Create and manage AI agent tasks</Text>

      <View style={styles.createTaskCard}>
        <Text style={styles.createTaskTitle}>Create New Task</Text>
        
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Task Type</Text>
          <View style={styles.taskTypeButtons}>
            {[
              { key: 'shopping.discover_products', label: '🛍️ Product Discovery' },
              { key: 'logistics.estimate', label: '🚛 Logistics Estimate' },
              { key: 'docs.generate_pack', label: '📄 Document Generation' },
              { key: 'research.market', label: '📊 Market Research' }
            ].map(type => (
              <TouchableOpacity
                key={type.key}
                style={[styles.taskTypeButton, taskForm.task_type === type.key && styles.activeTaskTypeButton]}
                onPress={() => setTaskForm({...taskForm, task_type: type.key})}
              >
                <Text style={[styles.taskTypeButtonText, taskForm.task_type === type.key && styles.activeTaskTypeButtonText]}>
                  {type.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Task Name *</Text>
          <TextInput
            style={styles.input}
            value={taskForm.task_name}
            onChangeText={(text) => setTaskForm({...taskForm, task_name: text})}
            placeholder="Find wireless headphones under $100"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Description *</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={taskForm.description}
            onChangeText={(text) => setTaskForm({...taskForm, description: text})}
            placeholder="Detailed description of what you want the AI to do..."
            multiline
            numberOfLines={3}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Execution Mode</Text>
          <View style={styles.executionButtons}>
            {[
              { key: 'manual', label: 'Manual', desc: 'I approve each action' },
              { key: 'semi_auto', label: 'Semi-Auto', desc: 'AI proposes actions' },
              { key: 'auto', label: 'Auto', desc: 'AI executes automatically' }
            ].map(mode => (
              <TouchableOpacity
                key={mode.key}
                style={[styles.executionButton, taskForm.mode === mode.key && styles.activeExecutionButton]}
                onPress={() => setTaskForm({...taskForm, mode: mode.key as any})}
              >
                <Text style={[styles.executionButtonText, taskForm.mode === mode.key && styles.activeExecutionButtonText]}>
                  {mode.label}
                </Text>
                <Text style={[styles.executionButtonDesc, taskForm.mode === mode.key && styles.activeExecutionButtonDesc]}>
                  {mode.desc}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <TouchableOpacity style={styles.createTaskButton} onPress={handleCreateTask} disabled={loading}>
          {loading ? <ActivityIndicator color="white" /> : (
            <>
              <Ionicons name="add-circle" size={20} color="white" />
              <Text style={styles.createTaskButtonText}>Create Task</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.tasksListCard}>
        <Text style={styles.tasksListTitle}>Active Tasks</Text>
        {tasks.map((task) => (
          <View key={task._id} style={styles.taskListItem}>
            <View style={styles.taskItemHeader}>
              <Text style={styles.taskItemName}>{task.task_name}</Text>
              <View style={[styles.taskStatusBadge, getStatusStyle(task.status)]}>
                <Text style={styles.taskStatusText}>{task.status}</Text>
              </View>
            </View>
            <Text style={styles.taskItemDescription}>{task.description}</Text>
            <Text style={styles.taskItemType}>Type: {task.task_type}</Text>
            <Text style={styles.taskItemDate}>
              Created: {new Date(task.created_at).toLocaleDateString()}
            </Text>
            
            <View style={styles.taskActions}>
              {task.status === 'pending' && (
                <>
                  <TouchableOpacity
                    style={styles.approveButton}
                    onPress={() => handleTaskAction(task._id, 'approve')}
                  >
                    <Ionicons name="checkmark" size={16} color="white" />
                    <Text style={styles.actionButtonText}>Approve</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={styles.rejectButton}
                    onPress={() => handleTaskAction(task._id, 'reject')}
                  >
                    <Ionicons name="close" size={16} color="white" />
                    <Text style={styles.actionButtonText}>Reject</Text>
                  </TouchableOpacity>
                </>
              )}
              
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => handleTaskAction(task._id, 'cancel')}
              >
                <Ionicons name="stop" size={16} color="white" />
                <Text style={styles.actionButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
        
        {tasks.length === 0 && (
          <View style={styles.noTasksContainer}>
            <Ionicons name="list" size={48} color="#ccc" />
            <Text style={styles.noTasksTitle}>No Tasks Created</Text>
            <Text style={styles.noTasksDescription}>Create your first AI agent task above</Text>
          </View>
        )}
      </View>
    </View>
  );

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'pending': return { backgroundColor: '#ffc107' };
      case 'approved': return { backgroundColor: '#17a2b8' };
      case 'executing': return { backgroundColor: '#007bff' };
      case 'completed': return { backgroundColor: '#28a745' };
      case 'failed': return { backgroundColor: '#dc3545' };
      case 'cancelled': return { backgroundColor: '#6c757d' };
      default: return { backgroundColor: '#ccc' };
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🤖 AI User Agents</Text>
        <Text style={styles.subtitle}>Your personal AI assistants</Text>
      </View>

      <View style={styles.tabContainer}>
        {renderTabButton('dashboard', 'Dashboard', 'analytics')}
        {renderTabButton('config', 'Config', 'settings')}
        {renderTabButton('tasks', 'Tasks', 'list')}
      </View>

      {activeTab === 'dashboard' && renderDashboardTab()}
      {activeTab === 'config' && renderConfigTab()}
      {activeTab === 'tasks' && renderTasksTab()}
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
  agentOverview: {
    gap: 16,
  },
  agentCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e1e5e9',
  },
  agentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  agentInfo: {
    flex: 1,
  },
  agentRole: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  agentStyle: {
    fontSize: 14,
    color: '#666',
  },
  agentMode: {
    alignItems: 'center',
  },
  modeLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  modeValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007AFF',
    textTransform: 'capitalize',
  },
  agentDetails: {
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  analyticsCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e1e5e9',
  },
  analyticsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 16,
  },
  analyticsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  analyticsItem: {
    flex: 1,
    alignItems: 'center',
  },
  analyticsValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 4,
  },
  analyticsLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  recentTasks: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e1e5e9',
  },
  recentTasksTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 16,
  },
  taskCard: {
    borderWidth: 1,
    borderColor: '#e1e5e9',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  taskName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginLeft: 8,
  },
  statusText: {
    fontSize: 10,
    color: 'white',
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  taskDescription: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  taskDate: {
    fontSize: 10,
    color: '#999',
  },
  noTasksText: {
    textAlign: 'center',
    color: '#666',
    fontStyle: 'italic',
  },
  noAgentCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 32,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e1e5e9',
  },
  noAgentTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  noAgentText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  setupButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  setupButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
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
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
  },
  roleButtons: {
    gap: 12,
  },
  roleButton: {
    borderWidth: 1,
    borderColor: '#e1e5e9',
    borderRadius: 8,
    padding: 12,
    backgroundColor: 'white',
  },
  activeRoleButton: {
    borderColor: '#007AFF',
    backgroundColor: '#f0f8ff',
  },
  roleButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  activeRoleButtonText: {
    color: '#007AFF',
  },
  roleButtonDesc: {
    fontSize: 12,
    color: '#666',
  },
  activeRoleButtonDesc: {
    color: '#007AFF',
  },
  styleButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  styleButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#f8f9fa',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#e1e5e9',
  },
  activeStyleButton: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  styleButtonText: {
    fontSize: 12,
    color: '#666',
  },
  activeStyleButtonText: {
    color: 'white',
  },
  modeButtons: {
    gap: 8,
  },
  modeButton: {
    borderWidth: 1,
    borderColor: '#e1e5e9',
    borderRadius: 8,
    padding: 12,
    backgroundColor: 'white',
  },
  activeModeButton: {
    borderColor: '#007AFF',
    backgroundColor: '#f0f8ff',
  },
  modeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  activeModeButtonText: {
    color: '#007AFF',
  },
  modeButtonDesc: {
    fontSize: 12,
    color: '#666',
  },
  activeModeButtonDesc: {
    color: '#007AFF',
  },
  switchGroup: {
    gap: 16,
    marginBottom: 16,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  switchLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  switch: {
    width: 50,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#e1e5e9',
    justifyContent: 'center',
    padding: 2,
  },
  switchActive: {
    backgroundColor: '#007AFF',
  },
  switchThumb: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  switchThumbActive: {
    transform: [{ translateX: 20 }],
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  createTaskCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e1e5e9',
  },
  createTaskTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 16,
  },
  taskTypeButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  taskTypeButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#f8f9fa',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#e1e5e9',
  },
  activeTaskTypeButton: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  taskTypeButtonText: {
    fontSize: 12,
    color: '#666',
  },
  activeTaskTypeButtonText: {
    color: 'white',
  },
  executionButtons: {
    gap: 8,
  },
  executionButton: {
    borderWidth: 1,
    borderColor: '#e1e5e9',
    borderRadius: 8,
    padding: 12,
    backgroundColor: 'white',
  },
  activeExecutionButton: {
    borderColor: '#007AFF',
    backgroundColor: '#f0f8ff',
  },
  executionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  activeExecutionButtonText: {
    color: '#007AFF',
  },
  executionButtonDesc: {
    fontSize: 12,
    color: '#666',
  },
  activeExecutionButtonDesc: {
    color: '#007AFF',
  },
  createTaskButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#28a745',
    padding: 16,
    borderRadius: 8,
    marginTop: 8,
  },
  createTaskButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  tasksListCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e1e5e9',
  },
  tasksListTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 16,
  },
  taskListItem: {
    borderWidth: 1,
    borderColor: '#e1e5e9',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  taskItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  taskItemName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
    flex: 1,
  },
  taskStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginLeft: 8,
  },
  taskStatusText: {
    fontSize: 10,
    color: 'white',
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  taskItemDescription: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  taskItemType: {
    fontSize: 10,
    color: '#999',
    marginBottom: 4,
  },
  taskItemDate: {
    fontSize: 10,
    color: '#999',
    marginBottom: 12,
  },
  taskActions: {
    flexDirection: 'row',
    gap: 8,
  },
  approveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#28a745',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  rejectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#dc3545',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  cancelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#6c757d',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  actionButtonText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '600',
    marginLeft: 4,
  },
  noTasksContainer: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  noTasksTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 12,
    marginBottom: 4,
  },
  noTasksDescription: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
});

export default AIUserAgentsScreen;