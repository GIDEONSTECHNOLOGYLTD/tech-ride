import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Linking,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const HelpScreen = ({ navigation }: any) => {
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const faqs = [
    {
      question: 'How do I go online to accept rides?',
      answer: 'Tap the "GO ONLINE" button on your dashboard. Make sure you have location and notification permissions enabled.',
    },
    {
      question: 'When will I receive my earnings?',
      answer: 'Earnings are processed weekly on Mondays. Make sure your bank details are up to date in your profile.',
    },
    {
      question: 'How is my fare calculated?',
      answer: 'Fares are calculated based on distance, time, and demand. You receive 80% of the fare, with 20% going to the platform.',
    },
    {
      question: 'What if a rider cancels?',
      answer: 'If a rider cancels after you\'ve accepted, you may receive a cancellation fee depending on how long you waited.',
    },
    {
      question: 'How do I update my documents?',
      answer: 'Go to Profile > Documents and tap "Update Document" for the document you want to change.',
    },
    {
      question: 'What if I have a safety concern?',
      answer: 'Use the emergency button in the app or call local emergency services immediately. Report the incident to support.',
    },
  ];

  const contactOptions = [
    {
      icon: 'phone',
      title: 'Call Support',
      subtitle: '+234 800 123 4567',
      action: () => Linking.openURL('tel:+2348001234567'),
    },
    {
      icon: 'email',
      title: 'Email Support',
      subtitle: 'support@techride.com',
      action: () => Linking.openURL('mailto:support@techride.com'),
    },
    {
      icon: 'whatsapp',
      title: 'WhatsApp',
      subtitle: 'Chat with us',
      action: () => Linking.openURL('https://wa.me/2348001234567'),
    },
    {
      icon: 'web',
      title: 'Help Center',
      subtitle: 'Visit our website',
      action: () => Linking.openURL('https://techride.com/help'),
    },
  ];

  const quickActions = [
    {
      icon: 'shield-alert',
      title: 'Report Safety Issue',
      color: '#F44336',
      action: () => Alert.alert('Report Safety Issue', 'This will open a form to report your safety concern.'),
    },
    {
      icon: 'account-question',
      title: 'Account Issues',
      color: '#FF9800',
      action: () => Alert.alert('Account Issues', 'Contact support for account-related problems.'),
    },
    {
      icon: 'cash-remove',
      title: 'Payment Problems',
      color: '#1E88E5',
      action: () => Alert.alert('Payment Problems', 'Report any payment or earnings issues.'),
    },
    {
      icon: 'bug',
      title: 'Report Bug',
      color: '#9C27B0',
      action: () => Alert.alert('Report Bug', 'Help us improve by reporting bugs you encounter.'),
    },
  ];

  const toggleFaq = (index: number) => {
    setExpandedFaq(expandedFaq === index ? null : index);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-left" size={24} color="#212121" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Help & Support</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content}>
        {/* Emergency */}
        <TouchableOpacity
          style={styles.emergencyButton}
          onPress={() => Linking.openURL('tel:911')}
        >
          <Icon name="alert-circle" size={24} color="#FFF" />
          <Text style={styles.emergencyText}>Emergency: Call 911</Text>
        </TouchableOpacity>

        {/* Contact Options */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Support</Text>
          {contactOptions.map((option, index) => (
            <TouchableOpacity
              key={index}
              style={styles.contactCard}
              onPress={option.action}
            >
              <View style={styles.contactIcon}>
                <Icon name={option.icon} size={24} color="#00C851" />
              </View>
              <View style={styles.contactInfo}>
                <Text style={styles.contactTitle}>{option.title}</Text>
                <Text style={styles.contactSubtitle}>{option.subtitle}</Text>
              </View>
              <Icon name="chevron-right" size={24} color="#CCC" />
            </TouchableOpacity>
          ))}
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsGrid}>
            {quickActions.map((action, index) => (
              <TouchableOpacity
                key={index}
                style={styles.actionCard}
                onPress={action.action}
              >
                <View style={[styles.actionIcon, { backgroundColor: action.color + '20' }]}>
                  <Icon name={action.icon} size={28} color={action.color} />
                </View>
                <Text style={styles.actionTitle}>{action.title}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* FAQs */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
          {faqs.map((faq, index) => (
            <View key={index} style={styles.faqCard}>
              <TouchableOpacity
                style={styles.faqQuestion}
                onPress={() => toggleFaq(index)}
              >
                <Text style={styles.faqQuestionText}>{faq.question}</Text>
                <Icon
                  name={expandedFaq === index ? 'chevron-up' : 'chevron-down'}
                  size={24}
                  color="#666"
                />
              </TouchableOpacity>
              {expandedFaq === index && (
                <View style={styles.faqAnswer}>
                  <Text style={styles.faqAnswerText}>{faq.answer}</Text>
                </View>
              )}
            </View>
          ))}
        </View>

        {/* App Info */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>TechRide Driver v1.0.0</Text>
          <Text style={styles.footerSubtext}>
            We're here to help 24/7
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFF',
    padding: 20,
    paddingTop: 50,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#212121',
  },
  content: {
    flex: 1,
  },
  emergencyButton: {
    backgroundColor: '#F44336',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    margin: 20,
    padding: 16,
    borderRadius: 10,
  },
  emergencyText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#212121',
    marginLeft: 20,
    marginBottom: 15,
  },
  contactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    marginHorizontal: 20,
    marginBottom: 10,
    padding: 15,
    borderRadius: 10,
  },
  contactIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  contactInfo: {
    flex: 1,
    marginLeft: 15,
  },
  contactTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212121',
  },
  contactSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 15,
  },
  actionCard: {
    width: '48%',
    backgroundColor: '#FFF',
    margin: 5,
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  actionIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  actionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#212121',
    textAlign: 'center',
  },
  faqCard: {
    backgroundColor: '#FFF',
    marginHorizontal: 20,
    marginBottom: 10,
    borderRadius: 10,
    overflow: 'hidden',
  },
  faqQuestion: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
  },
  faqQuestionText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: '#212121',
  },
  faqAnswer: {
    paddingHorizontal: 15,
    paddingBottom: 15,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    paddingTop: 15,
  },
  faqAnswerText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  footerText: {
    fontSize: 14,
    color: '#666',
  },
  footerSubtext: {
    fontSize: 12,
    color: '#999',
    marginTop: 5,
  },
});

export default HelpScreen;
