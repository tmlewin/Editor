// Simple test script to verify Firebase connection
// Run with: node src/tests/firebase-test.js

// Load environment variables
const { firebaseConfig } = require('../config/env');

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc, getDocs, deleteDoc, doc } = require('firebase/firestore');

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
