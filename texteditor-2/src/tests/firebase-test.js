// Simple test script to verify Firebase connection
// Run with: node src/tests/firebase-test.js

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc, getDocs, deleteDoc, doc } = require('firebase/firestore');

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCBycacqDrZDF2fwUTW-i_MIxToRDfZdaU",
  authDomain: "disney-f0465.firebaseapp.com",
  projectId: "disney-f0465",
  storageBucket: "disney-f0465.firebasestorage.app",
  messagingSenderId: "882131124902",
  appId: "1:882131124902:web:3176a466ae927c784e2a67",
  measurementId: "G-LJTPNJFEJB"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function testFirebase() {
  console.log('Starting Firebase test...');
  
  try {
    // Test document
    const testDoc = {
      title: 'Test Document',
      content: '<p>This is a test document.</p>',
      tags: ['test'],
      createdAt: new Date(),
      modifiedAt: new Date()
    };
    
    // Add a test document
    console.log('Adding test document...');
    const docRef = await addDoc(collection(db, 'documents'), testDoc);
    console.log('Document added with ID:', docRef.id);
    
    // Retrieve documents
    console.log('Retrieving documents...');
    const querySnapshot = await getDocs(collection(db, 'documents'));
    console.log('Documents found:', querySnapshot.size);
    
    querySnapshot.forEach((doc) => {
      console.log(`Document ${doc.id}:`, doc.data());
    });
    
    // Delete the test document
    console.log('Deleting test document...');
    await deleteDoc(doc(db, 'documents', docRef.id));
    console.log('Test document deleted');
    
    console.log('Firebase test completed successfully!');
  } catch (error) {
    console.error('Error during Firebase test:', error);
  }
}

testFirebase();
