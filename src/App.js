import { useState, useEffect } from 'react';
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';
import 'firebase/compat/storage';
import "./App.css";



const firebaseConfig = {
  apiKey: "AIzaSyB72bVL0vk-yNCbXOZsDXGSpz5rPHFu5UA",
  authDomain: "react-microblog-96be7.firebaseapp.com",
  projectId: "react-microblog-96be7",
  storageBucket: "react-microblog-96be7.appspot.com",
  messagingSenderId: "841484084755",
  appId: "1:841484084755:web:0c72b09076263f2805c1e6",
  measurementId: "G-12N1LMQSDE"
};

firebase.initializeApp(firebaseConfig);




firebase.initializeApp(firebaseConfig);

const db = firebase.firestore();
const auth = firebase.auth();

function App() {
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [content, setContent] = useState('');

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setUser(user);
      } else {
        setUser(null);
      }
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    const unsubscribe = db.collection('posts').orderBy('createdAt', 'desc').onSnapshot((snapshot) => {
      const newPosts = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setPosts(newPosts);
    });
    return unsubscribe;
  }, []);

  const handleLogin = async () => {
    try {
      const provider = new firebase.auth.GoogleAuthProvider();
      await auth.signInWithPopup(provider);
    } catch (error) {
      console.log(error);
    }
  };

  const handleLogout = async () => {
    try {
      await auth.signOut();
    } catch (error) {
      console.log(error);
    }
  };

  const handleAddPost = async () => {
    try {
      const post = {
        content,
        authorName: user.displayName,
        createdAt: new Date(),
      };
      await db.collection('posts').add(post);
      setContent('');
    } catch (error) {
      console.log(error);
    }
  };

  const handleLikePost = async (postId) => {
    try {
      await db.collection('posts').doc(postId).update({
        likes: firebase.firestore.FieldValue.increment(1),
      });
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div>
      <header>
        <h1>Gk microblog</h1>
        {user ? (
          <div>
            <p>Welcome, {user.displayName}!</p>
            <button onClick={handleLogout}>Logout</button>
          </div>
        ) : (
          <button onClick={handleLogin}>
            
            Login with Google
            <img class="imggl"src={"https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/Google_%22G%22_Logo.svg/2048px-Google_%22G%22_Logo.svg.png"} alt="Google logo" /></button>
        )}
      </header>
      <main>
        <form onSubmit={(e) => e.preventDefault()}>
          <textarea value={content} onChange={(e) => setContent(e.target.value)} />
          <button onClick={handleAddPost} disabled={!user}>Add Post</button>
        </form>
        {posts.map((post) => (
          <div key={post.id}>
            <p>{post.content}</p>
            <p>By {post.authorName}</p>
            <button class="like-button" onClick={() => handleLikePost(post.id)}>Like</button>
            <p>{post.likes} likes</p>
          </div>
        ))}
      </main>
    </div>
  );
}

export default App;