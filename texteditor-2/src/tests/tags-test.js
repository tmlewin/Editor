// Simple test script to verify Tags functionality with Firebase
// Run with: node src/tests/tags-test.js

// Load environment variables
const { firebaseConfig } = require('../config/env');

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc, getDocs, deleteDoc, doc, setDoc, updateDoc, arrayUnion, arrayRemove } = require('firebase/firestore');

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Collection references
const TAGS_COLLECTION = 'tags';
const DOCUMENTS_COLLECTION = 'documents';

async function testTagsFunctionality() {
  console.log('Starting Tags functionality test...');

  try {
    // 1. Create a test document
    console.log('Creating test document...');
    const testDoc = {
      title: 'Test Document for Tags',
      content: '<p>This is a test document for tags.</p>',
      tags: ['test'],
      createdAt: new Date(),
      modifiedAt: new Date()
    };

    const docRef = await addDoc(collection(db, DOCUMENTS_COLLECTION), testDoc);
    console.log('Document added with ID:', docRef.id);

    // 2. Create some test tags
    console.log('Creating test tags...');
    const testTags = ['javascript', 'react', 'firebase'];

    for (const tagName of testTags) {
      await setDoc(doc(db, TAGS_COLLECTION, tagName), {
        name: tagName,
        color: '#6b7280',
        createdAt: new Date(),
        count: 0
      });
      console.log(`Tag "${tagName}" created`);
    }

    // 3. Add tags to the document
    console.log('Adding tags to document...');
    await updateDoc(doc(db, DOCUMENTS_COLLECTION, docRef.id), {
      tags: arrayUnion(...testTags)
    });

    // 4. Update tag counts
    for (const tagName of testTags) {
      const tagRef = doc(db, TAGS_COLLECTION, tagName);
      await updateDoc(tagRef, {
        count: 1
      });
    }

    // 5. Retrieve the document to verify tags
    console.log('Retrieving document to verify tags...');
    const docSnapshot = await getDocs(collection(db, DOCUMENTS_COLLECTION));

    docSnapshot.forEach((doc) => {
      if (doc.id === docRef.id) {
        console.log(`Document ${doc.id} tags:`, doc.data().tags);
      }
    });

    // 6. Remove a tag from the document
    console.log('Removing a tag from document...');
    await updateDoc(doc(db, DOCUMENTS_COLLECTION, docRef.id), {
      tags: arrayRemove('react')
    });

    // 7. Update tag count
    await updateDoc(doc(db, TAGS_COLLECTION, 'react'), {
      count: 0
    });

    // 8. Retrieve all tags
    console.log('Retrieving all tags...');
    const tagsSnapshot = await getDocs(collection(db, TAGS_COLLECTION));

    console.log('All tags:');
    tagsSnapshot.forEach((doc) => {
      console.log(`- ${doc.id}: count=${doc.data().count}`);
    });

    // 9. Clean up - delete test document and tags
    console.log('Cleaning up...');
    await deleteDoc(doc(db, DOCUMENTS_COLLECTION, docRef.id));

    for (const tagName of testTags) {
      await deleteDoc(doc(db, TAGS_COLLECTION, tagName));
    }

    console.log('Tags functionality test completed successfully!');
  } catch (error) {
    console.error('Error during tags test:', error);
  }
}

testTagsFunctionality();
