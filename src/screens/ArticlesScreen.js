import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
} from 'react-native';
import { Card } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const ArticlesScreen = () => {
  const [searchText, setSearchText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [showArticleModal, setShowArticleModal] = useState(false);

  const categories = [
    { id: 'all', name: 'All', icon: 'book-open-variant' },
    { id: 'nutrition', name: 'Nutrition', icon: 'apple' },
    { id: 'hygiene', name: 'Hygiene', icon: 'hand-wash' },
    { id: 'warning', name: 'Warning Signs', icon: 'alert-circle' },
    { id: 'development', name: 'Development', icon: 'human-baby-changing-table' },
    { id: 'vaccination', name: 'Vaccination', icon: 'needle' },
  ];

  const articles = [
    {
      id: '1',
      title: 'Early Signs of Malnutrition in Children',
      category: 'warning',
      readTime: '5 min',
      icon: '⚠️',
      color: '#FFEBEE',
      iconColor: '#FF5252',
      excerpt: 'Learn to identify warning signs before they become severe',
      content: `Malnutrition is a serious condition that can affect a child's growth and development. Early detection is crucial for effective intervention.

**Key Warning Signs:**

1. **Physical Signs:**
   • Unexplained weight loss or no weight gain
   • Swollen belly (kwashiorkor)
   • Thin arms and legs
   • Dry, flaky skin
   • Brittle hair that falls out easily
   • Slow wound healing

2. **Behavioral Changes:**
   • Lack of energy and constant fatigue
   • Irritability and mood swings
   • Poor concentration in school
   • Loss of interest in play
   • Excessive crying in younger children

3. **Health Issues:**
   • Frequent infections
   • Delayed developmental milestones
   • Dental problems
   • Vision problems

**When to Seek Help:**
If you notice any combination of these signs, consult your healthcare provider immediately. Early intervention can prevent serious complications.

**Prevention Tips:**
• Ensure balanced meals with all food groups
• Regular growth monitoring
• Maintain good hygiene practices
• Follow vaccination schedules
• Address feeding difficulties promptly`,
    },
    {
      id: '2',
      title: 'Iron-Rich Foods for Growing Children',
      category: 'nutrition',
      readTime: '4 min',
      icon: '🍎',
      color: '#FFF3E0',
      iconColor: '#FFA726',
      excerpt: 'Prevent anemia with the right foods',
      content: `Iron is essential for your child's growth, brain development, and immune system. Iron deficiency is one of the most common nutritional deficiencies in children.

**Why Iron Matters:**
• Carries oxygen throughout the body
• Supports brain development
• Strengthens immune system
• Prevents anemia

**Best Iron Sources:**

**Heme Iron (Better Absorbed):**
• Red meat (beef, lamb)
• Poultry (chicken, turkey)
• Fish (tuna, salmon)
• Eggs

**Non-Heme Iron (Plant Sources):**
• Fortified cereals and breads
• Beans and lentils
• Dark leafy greens (spinach, kale)
• Tofu and tempeh
• Dried fruits (raisins, apricots)
• Nuts and seeds

**Absorption Tips:**
• Pair iron foods with Vitamin C (oranges, tomatoes, strawberries)
• Avoid tea and coffee with meals
• Cook in iron cookware
• Don't mix calcium-rich foods with iron-rich meals

**Daily Requirements:**
• 7-12 months: 11 mg
• 1-3 years: 7 mg
• 4-8 years: 10 mg`,
    },
    {
      id: '3',
      title: 'Hand Washing: The First Defense',
      category: 'hygiene',
      readTime: '3 min',
      icon: '🧼',
      color: '#E3F2FD',
      iconColor: '#42A5F5',
      excerpt: 'Prevent infections through proper hygiene',
      content: `Proper hand washing is one of the most effective ways to prevent the spread of infections and keep your child healthy.

**When to Wash Hands:**
• Before eating or preparing food
• After using the toilet
• After playing outside
• After touching animals
• After coughing or sneezing
• When hands look dirty

**Proper Hand Washing Technique:**

1. **Wet** hands with clean, running water
2. **Apply** soap and lather well
3. **Scrub** all surfaces for at least 20 seconds
4. **Rinse** thoroughly under running water
5. **Dry** with a clean towel or air dry

**Making It Fun for Kids:**
• Sing a 20-second song while washing
• Use colorful, fun-shaped soaps
• Create a hand washing chart with stickers
• Let them choose their own towel
• Make bubble contests

**Hand Sanitizer Alternative:**
When soap and water aren't available, use hand sanitizer with at least 60% alcohol. However, it's not effective against all germs and shouldn't replace hand washing.`,
    },
    {
      id: '4',
      title: 'Dealing with Picky Eaters',
      category: 'nutrition',
      readTime: '6 min',
      icon: '🍽️',
      color: '#FFF3E0',
      iconColor: '#FFA726',
      excerpt: 'Strategies to encourage healthy eating',
      content: `Picky eating is common in children, but with patience and the right strategies, you can help your child develop healthy eating habits.

**Understanding Picky Eating:**
• Normal developmental phase
• Peak between ages 2-5
• Often related to asserting independence
• Can be influenced by texture, color, or temperature

**Effective Strategies:**

1. **Make Meals Enjoyable:**
   • Create a calm, positive atmosphere
   • Eat together as a family
   • Avoid distractions (TV, tablets)
   • Keep conversations pleasant

2. **Presentation Matters:**
   • Use colorful plates and utensils
   • Create fun shapes with food
   • Make "rainbow plates" with various colors
   • Let them help with plating

3. **Involvement and Choice:**
   • Let them help with grocery shopping
   • Involve in meal preparation
   • Offer 2-3 healthy choices
   • Create a weekly menu together

4. **The "One Bite Rule":**
   • Encourage trying one bite
   • No forcing or bribing
   • Praise attempts, not completion
   • May take 10-15 exposures

**What NOT to Do:**
• Don't use dessert as a reward
• Avoid becoming a short-order cook
• Don't force clean plates
• Avoid negative food talk

**When to Worry:**
Consult a pediatrician if your child:
• Is losing weight
• Has no appetite for days
• Shows signs of nutritional deficiency
• Has extreme food aversions`,
    },
    {
      id: '5',
      title: 'Breastfeeding: The First 1000 Days',
      category: 'nutrition',
      readTime: '7 min',
      icon: '🍼',
      color: '#FFF3E0',
      iconColor: '#FFA726',
      excerpt: 'Optimal nutrition from birth to 2 years',
      content: `The first 1000 days (from conception to age 2) are crucial for a child's development. Breastfeeding plays a vital role during this period.

**Benefits of Breastfeeding:**

**For Baby:**
• Perfect nutrition tailored to needs
• Antibodies for immune protection
• Lower risk of infections
• Better cognitive development
• Reduced risk of obesity
• Lower risk of allergies

**For Mother:**
• Faster postpartum recovery
• Natural birth spacing
• Reduced risk of breast and ovarian cancer
• Economic benefits
• Emotional bonding

**WHO Recommendations:**
• Exclusive breastfeeding for first 6 months
• Continued breastfeeding until 2 years or beyond
• Introduction of complementary foods at 6 months

**Common Challenges and Solutions:**
• Latching difficulties → Seek lactation consultant
• Low milk supply → Frequent feeding, proper hydration
• Sore nipples → Check positioning, use lanolin
• Working mothers → Express and store milk

**Complementary Feeding (6+ months):**
• Start with single ingredients
• Iron-rich foods first
• Gradually increase variety
• Continue breastfeeding
• No honey before 12 months
• Avoid added salt and sugar`,
    },
  ];

  const filteredArticles = articles.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(searchText.toLowerCase()) ||
                          article.excerpt.toLowerCase().includes(searchText.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || 
                            article.category === selectedCategory.toLowerCase();
    return matchesSearch && matchesCategory;
  });

  const openArticle = (article) => {
    setSelectedArticle(article);
    setShowArticleModal(true);
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Icon name="magnify" size={20} color="#757575" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search articles..."
            value={searchText}
            onChangeText={setSearchText}
            placeholderTextColor="#9E9E9E"
          />
        </View>

        {/* Categories */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoriesContainer}
          contentContainerStyle={styles.categoriesContent}
        >
          {categories.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.categoryPill,
                selectedCategory === category.name && styles.categoryPillActive,
              ]}
              onPress={() => setSelectedCategory(category.name)}
            >
              <Icon
                name={category.icon}
                size={16}
                color={selectedCategory === category.name ? '#FFFFFF' : '#757575'}
              />
              <Text
                style={[
                  styles.categoryText,
                  selectedCategory === category.name && styles.categoryTextActive,
                ]}
              >
                {category.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Articles List */}
        <View style={styles.articlesList}>
          {filteredArticles.map((article) => (
            <TouchableOpacity
              key={article.id}
              onPress={() => openArticle(article)}
              activeOpacity={0.7}
            >
              <Card style={styles.articleCard}>
                <Card.Content>
                  <View style={styles.articleHeader}>
                    <View style={[styles.articleIcon, { backgroundColor: article.color }]}>
                      <Text style={styles.articleIconText}>{article.icon}</Text>
                    </View>
                    <View style={styles.articleContent}>
                      <Text style={styles.articleTitle}>{article.title}</Text>
                      <Text style={styles.articleExcerpt}>{article.excerpt}</Text>
                      <View style={styles.articleMeta}>
                        <Text style={styles.articleReadTime}>{article.readTime} read</Text>
                        <View style={[styles.articleTag, { backgroundColor: article.color }]}>
                          <Text style={[styles.articleTagText, { color: article.iconColor }]}>
                            {categories.find(c => c.id === article.category)?.name}
                          </Text>
                        </View>
                      </View>
                    </View>
                  </View>
                </Card.Content>
              </Card>
            </TouchableOpacity>
          ))}
        </View>

        {/* Evidence Based Notice */}
        <Card style={styles.noticeCard}>
          <Card.Content>
            <View style={styles.noticeHeader}>
              <Icon name="information" size={24} color="#1976D2" />
              <Text style={styles.noticeTitle}>Evidence-Based Information</Text>
            </View>
            <Text style={styles.noticeText}>
              All articles are based on WHO guidelines and current pediatric research. 
              They do not replace professional medical advice. Always consult your 
              healthcare provider for personalized guidance.
            </Text>
          </Card.Content>
        </Card>
      </ScrollView>

      {/* Article Modal */}
      <Modal
        visible={showArticleModal}
        animationType="slide"
        onRequestClose={() => setShowArticleModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowArticleModal(false)}>
              <Icon name="arrow-left" size={24} color="#212121" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Article</Text>
            <View style={{ width: 24 }} />
          </View>
          
          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            {selectedArticle && (
              <>
                <View style={styles.articleDetailHeader}>
                  <View style={[styles.articleDetailIcon, { backgroundColor: selectedArticle.color }]}>
                    <Text style={styles.articleDetailIconText}>{selectedArticle.icon}</Text>
                  </View>
                  <Text style={styles.articleDetailTitle}>{selectedArticle.title}</Text>
                  <Text style={styles.articleDetailMeta}>{selectedArticle.readTime} read</Text>
                </View>
                
                <Text style={styles.articleDetailContent}>{selectedArticle.content}</Text>
              </>
            )}
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 16,
    padding: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 25,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: '#212121',
  },
  categoriesContainer: {
    maxHeight: 50,
    marginBottom: 8,
  },
  categoriesContent: {
    paddingHorizontal: 16,
  },
  categoryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    marginRight: 8,
    elevation: 1,
  },
  categoryPillActive: {
    backgroundColor: '#4CAF50',
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#757575',
    marginLeft: 6,
  },
  categoryTextActive: {
    color: '#FFFFFF',
  },
  articlesList: {
    padding: 16,
  },
  articleCard: {
    marginBottom: 12,
    borderRadius: 12,
    elevation: 2,
  },
  articleHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  articleIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  articleIconText: {
    fontSize: 24,
  },
  articleContent: {
    flex: 1,
  },
  articleTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#212121',
    marginBottom: 4,
  },
  articleExcerpt: {
    fontSize: 14,
    color: '#757575',
    marginBottom: 8,
    lineHeight: 20,
  },
  articleMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  articleReadTime: {
    fontSize: 12,
    color: '#9E9E9E',
  },
  articleTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  articleTagText: {
    fontSize: 11,
    fontWeight: '600',
  },
  noticeCard: {
    margin: 16,
    marginBottom: 24,
    backgroundColor: '#E3F2FD',
    borderWidth: 1,
    borderColor: '#42A5F5',
    borderRadius: 12,
  },
  noticeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  noticeTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1976D2',
    marginLeft: 8,
  },
  noticeText: {
    fontSize: 14,
    color: '#1565C0',
    lineHeight: 20,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#212121',
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  articleDetailHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  articleDetailIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  articleDetailIconText: {
    fontSize: 40,
  },
  articleDetailTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#212121',
    textAlign: 'center',
    marginBottom: 8,
  },
  articleDetailMeta: {
    fontSize: 14,
    color: '#757575',
  },
  articleDetailContent: {
    fontSize: 15,
    color: '#424242',
    lineHeight: 24,
    marginBottom: 24,
  },
});

export default ArticlesScreen;
