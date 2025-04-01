import * as React from 'react';
import { View, Text, StyleSheet, ScrollView, FlatList, TouchableOpacity, ActivityIndicator, Modal, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import GlobalStyles, { Layout, Typography, Colors, Cards } from '../../styles/globalStyles';

// Define the Post type to match the API response format
interface Post {
  id: string | number | null;
  title: string;
  content?: string;
  status?: string | null;
  // Add a unique identifier to ensure we can always distinguish posts
  _uniqueId?: string;
}

// Ensure component is defined as a proper React function component
const PostsComponent = () => {
  const [posts, setPosts] = React.useState<Post[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [apiResponse, setApiResponse] = React.useState<any>(null);
  // Add state for editing functionality
  const [selectedPost, setSelectedPost] = React.useState<Post | null>(null);
  const [isEditing, setIsEditing] = React.useState(false);
  const [editTitle, setEditTitle] = React.useState('');
  const [editContent, setEditContent] = React.useState('');
  const [updating, setUpdating] = React.useState(false);
  const [updateError, setUpdateError] = React.useState<string | null>(null);

  // Fetch posts from the Turso database
  React.useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('https://tar-tarframework.aws-eu-west-1.turso.io/v2/pipeline', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3NDM1MDY1OTIsImlkIjoiYjI1ODNhYTctNTQwOS00OTAyLWIxMWUtMzBkZjk5N2Q0NjIzIiwicmlkIjoiZmEwOWEwOWUtMTk3YS00M2M0LThmMDUtOTlmZTk0ZDhiZThkIn0.sKQEQR4b34LIs6pVW791zI7havvVEoKk9jHk1AvrOvr6OntKqyLGv85ZjRdeX4naSChv_ggGIbHNJgzMYxcxAA',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          requests: [
            {
              type: 'execute',
              stmt: {
                sql: 'SELECT * FROM posts'
              }
            },
            {
              type: 'close'
            }
          ]
        })
      });

      if (!response.ok) {
        throw new Error(`API responded with status: ${response.status}`);
      }

      const data = await response.json();
      
      // Save the full API response for debugging
      setApiResponse(data);
      console.log('API Response:', JSON.stringify(data, null, 2));
      
      let extractedPosts: Post[] = [];

      // Parse the specific Turso API response format
      if (data && 
          data.results && 
          Array.isArray(data.results) && 
          data.results.length > 0 && 
          data.results[0].type === "ok" && 
          data.results[0].response && 
          data.results[0].response.result && 
          data.results[0].response.result.rows) {
        
        const cols = data.results[0].response.result.cols.map((col: any) => col.name);
        const rows = data.results[0].response.result.rows;
        
        extractedPosts = rows.map((row: any[], index: number) => {
          // Create a post with a guaranteed unique ID for React keys
          const post: Post = {
            id: null,
            title: "",
            _uniqueId: `post-${index}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
          };
          
          // Map each column to its respective value
          cols.forEach((colName: string, colIndex: number) => {
            const cell = row[colIndex];
            if (cell && 'value' in cell) {
              post[colName as keyof Post] = cell.value;
            } else if (cell && cell.type !== 'null') {
              post[colName as keyof Post] = cell;
            } else {
              post[colName as keyof Post] = null;
            }
          });
          
          return post;
        });
      }
      
      console.log('Final extracted posts:', extractedPosts);
      setPosts(extractedPosts);
      setLoading(false);
      
      if (extractedPosts.length === 0) {
        setError('No posts found in the API response. The database might be empty.');
      }
    } catch (err) {
      console.error('Error fetching posts:', err);
      setError(`Failed to load posts: ${err instanceof Error ? err.message : 'Unknown error'}`);
      setLoading(false);
    }
  };

  // Function to handle opening the edit modal
  const handleEditPost = (post: Post) => {
    setSelectedPost(post);
    setEditTitle(post.title || '');
    setEditContent(post.content || '');
    setIsEditing(true);
    setUpdateError(null);
  };

  // Function to handle canceling edit
  const handleCancelEdit = () => {
    setIsEditing(false);
    setSelectedPost(null);
    setUpdateError(null);
  };

  // Function to update post in the database
  const handleUpdatePost = async () => {
    if (!selectedPost) return;
    
    try {
      setUpdating(true);
      setUpdateError(null);
      
      // Prepare the update SQL statement
      const updateSql = selectedPost.id 
        ? `UPDATE posts SET title = '${editTitle.replace(/'/g, "''")}', content = '${editContent.replace(/'/g, "''")}' WHERE id = ${selectedPost.id}`
        : `UPDATE posts SET title = '${editTitle.replace(/'/g, "''")}', content = '${editContent.replace(/'/g, "''")}' WHERE title = '${selectedPost.title.replace(/'/g, "''")}'`;
      
      const response = await fetch('https://tar-tarframework.aws-eu-west-1.turso.io/v2/pipeline', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3NDM1MDY1OTIsImlkIjoiYjI1ODNhYTctNTQwOS00OTAyLWIxMWUtMzBkZjk5N2Q0NjIzIiwicmlkIjoiZmEwOWEwOWUtMTk3YS00M2M0LThmMDUtOTlmZTk0ZDhiZThkIn0.sKQEQR4b34LIs6pVW791zI7havvVEoKk9jHk1AvrOvr6OntKqyLGv85ZjRdeX4naSChv_ggGIbHNJgzMYxcxAA',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          requests: [
            {
              type: 'execute',
              stmt: {
                sql: updateSql
              }
            },
            {
              type: 'close'
            }
          ]
        })
      });

      if (!response.ok) {
        throw new Error(`API responded with status: ${response.status}`);
      }

      // Update the post in the local state
      const updatedPosts = posts.map(post => {
        if ((selectedPost.id && post.id === selectedPost.id) || 
            (!selectedPost.id && post.title === selectedPost.title)) {
          return {
            ...post,
            title: editTitle,
            content: editContent
          };
        }
        return post;
      });
      
      setPosts(updatedPosts);
      setIsEditing(false);
      setSelectedPost(null);
      
      // Optional: Show success message or notification
      console.log('Post updated successfully');
    } catch (err) {
      console.error('Error updating post:', err);
      setUpdateError(`Failed to update post: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setUpdating(false);
    }
  };

  // Render individual post item with more details - redesigned as list item with divider
  const renderPostItem = ({ item, index, separators }: { item: Post, index: number, separators: any }) => (
    <TouchableOpacity 
      style={styles.postItem}
      onPress={() => handleEditPost(item)}
    >
      <View style={styles.postContent}>
        <Text style={styles.postTitle}>{item.title || 'Untitled Post'}</Text>
        {item.content && (
          <Text style={styles.postDescription} numberOfLines={1}>
            {item.content}
          </Text>
        )}
        {item.id && (
          <Text style={styles.postId}>ID: {item.id}</Text>
        )}
      </View>
      <Text style={styles.editIcon}>›</Text>
      {index < posts.length - 1 && <View style={styles.divider} />}
    </TouchableOpacity>
  );

  // Render edit modal component
  const renderEditModal = () => (
    <Modal
      visible={isEditing}
      animationType="slide"
      transparent={false}
      onRequestClose={handleCancelEdit}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.modalContainer}
      >
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Edit Post</Text>
          <TouchableOpacity onPress={handleCancelEdit}>
            <Text style={styles.cancelButton}>Cancel</Text>
          </TouchableOpacity>
        </View>
        
        {updateError && (
          <View style={styles.errorBanner}>
            <Text style={styles.errorText}>{updateError}</Text>
          </View>
        )}
        
        <View style={styles.formContainer}>
          <Text style={styles.inputLabel}>Title</Text>
          <TextInput
            style={styles.input}
            value={editTitle}
            onChangeText={setEditTitle}
            placeholder="Post title"
            placeholderTextColor={Colors.text.tertiary}
          />
          
          <Text style={styles.inputLabel}>Content</Text>
          <TextInput
            style={[styles.input, styles.contentInput]}
            value={editContent}
            onChangeText={setEditContent}
            placeholder="Post content"
            placeholderTextColor={Colors.text.tertiary}
            multiline
            textAlignVertical="top"
          />
          
          <TouchableOpacity 
            style={[styles.updateButton, (updating || !editTitle) ? styles.updateButtonDisabled : null]}
            onPress={handleUpdatePost}
            disabled={updating || !editTitle}
          >
            {updating ? (
              <ActivityIndicator size="small" color={Colors.background} />
            ) : (
              <Text style={styles.updateButtonText}>Update Post</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[Typography.title]}>Posts</Text>
        <Text style={Typography.body}>Manage your posts and content here.</Text>
      </View>
      
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          {apiResponse && (
            <View style={styles.apiResponseContainer}>
              <Text style={styles.apiResponseTitle}>API Response Structure:</Text>
              <ScrollView style={styles.apiResponseScroll}>
                <Text style={styles.apiResponseText}>
                  {apiResponse && typeof apiResponse === 'object' 
                    ? `Has 'results': ${!!apiResponse.results}\n` +
                      `Results is array: ${Array.isArray(apiResponse.results)}\n` +
                      `Results length: ${apiResponse.results ? apiResponse.results.length : 'N/A'}\n` +
                      (apiResponse.results && apiResponse.results.length > 0 
                        ? `First result has 'rows': ${!!apiResponse.results[0].rows}\n` +
                          `First result rows is array: ${Array.isArray(apiResponse.results[0].rows)}\n` +
                          `First result rows length: ${apiResponse.results[0].rows ? apiResponse.results[0].rows.length : 'N/A'}`
                        : 'Results array is empty')
                    : 'API response is not an object'
                  }
                </Text>
              </ScrollView>
            </View>
          )}
          <TouchableOpacity 
            style={[styles.retryButton]} 
            onPress={fetchPosts}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={posts}
          renderItem={renderPostItem}
          keyExtractor={(item, index) => item._uniqueId || `post-${index}-${Math.random().toString(36).substring(2, 9)}`}
          contentContainerStyle={styles.listContainer}
          ItemSeparatorComponent={() => <View style={styles.invisibleSeparator} />}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={Typography.noItemsText}>No posts found in the database. Try adding some posts.</Text>
              <TouchableOpacity 
                style={[styles.retryButton, { marginTop: 16 }]} 
                onPress={fetchPosts}
              >
                <Text style={styles.retryButtonText}>Refresh</Text>
              </TouchableOpacity>
            </View>
          }
        />
      )}
      
      {/* Render the edit modal */}
      {renderEditModal()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    padding: Layout.padding.padding,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.lightest,
  },
  listContainer: {
    // Remove padding to allow full-width list items
  },
  // New list item styles
  postItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: Colors.background,
    position: 'relative',
  },
  postContent: {
    flex: 1,
    paddingRight: 24, // Space for chevron
  },
  postTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 4,
  },
  postDescription: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginBottom: 2,
  },
  postId: {
    fontSize: 12,
    color: Colors.text.tertiary,
  },
  editIcon: {
    position: 'absolute',
    right: 16,
    top: '50%',
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text.tertiary,
    transform: [{ translateY: -12 }],
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border.lightest,
    position: 'absolute',
    left: 16,
    right: 0,
    bottom: 0,
  },
  invisibleSeparator: {
    height: 0,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    ...Typography.body,
    color: Colors.error,
    marginBottom: 16,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  retryButtonText: {
    color: Colors.background,
    fontSize: 16,
    fontWeight: '600',
  },
  emptyContainer: {
    padding: 20,
    alignItems: 'center',
  },
  apiResponseContainer: {
    width: '100%',
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
  },
  apiResponseTitle: {
    ...Typography.subtitle,
    marginBottom: 8,
  },
  apiResponseScroll: {
    maxHeight: 150,
  },
  apiResponseText: {
    fontFamily: 'monospace',
    fontSize: 12,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Layout.padding.padding,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.lightest,
  },
  modalTitle: {
    ...Typography.title,
    fontSize: 20,
  },
  cancelButton: {
    fontSize: 16,
    color: Colors.primary,
    fontWeight: '600',
  },
  formContainer: {
    padding: Layout.padding.padding,
  },
  inputLabel: {
    ...Typography.subtitle,
    marginBottom: 8,
    color: Colors.text.secondary,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.border.light,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
    color: Colors.text.primary,
    backgroundColor: Colors.background,
  },
  contentInput: {
    height: 150,
    textAlignVertical: 'top',
  },
  updateButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  updateButtonDisabled: {
    backgroundColor: Colors.border.light,
  },
  updateButtonText: {
    color: Colors.background,
    fontSize: 16,
    fontWeight: '600',
  },
  errorBanner: {
    backgroundColor: Colors.error,
    padding: 12,
    margin: Layout.padding.padding,
    borderRadius: 8,
  },
  // Keep existing styles
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    ...Typography.body,
    color: Colors.error,
    marginBottom: 16,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  retryButtonText: {
    color: Colors.background,
    fontSize: 16,
    fontWeight: '600',
  },
  emptyContainer: {
    padding: 20,
    alignItems: 'center',
  },
  apiResponseContainer: {
    width: '100%',
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
  },
  apiResponseTitle: {
    ...Typography.subtitle,
    marginBottom: 8,
  },
  apiResponseScroll: {
    maxHeight: 150,
  },
  apiResponseText: {
    fontFamily: 'monospace',
    fontSize: 12,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Layout.padding.padding,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.lightest,
  },
  modalTitle: {
    ...Typography.title,
    fontSize: 20,
  },
  cancelButton: {
    fontSize: 16,
    color: Colors.primary,
    fontWeight: '600',
  },
  formContainer: {
    padding: Layout.padding.padding,
  },
  inputLabel: {
    ...Typography.subtitle,
    marginBottom: 8,
    color: Colors.text.secondary,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.border.light,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
    color: Colors.text.primary,
    backgroundColor: Colors.background,
  },
  contentInput: {
    height: 150,
    textAlignVertical: 'top',
  },
  updateButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  updateButtonDisabled: {
    backgroundColor: Colors.border.light,
  },
  updateButtonText: {
    color: Colors.background,
    fontSize: 16,
    fontWeight: '600',
  },
  errorBanner: {
    backgroundColor: Colors.error,
    padding: 12,
    margin: Layout.padding.padding,
    borderRadius: 8,
  },
  editIconContainer: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
  editIcon: {
    fontSize: 16,
  },
  contentText: {
    marginTop: 4,
    color: Colors.text.secondary,
  },
  idText: {
    marginTop: 8,
    fontSize: 12,
    color: Colors.text.tertiary,
  },
});

// Export using default export
export default PostsComponent;
