import { db } from './firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

// Email credentials - in a real app, these should be environment variables
const EMAIL_USER = "neurex7@gmail.com";
const APP_PASSWORD = "wskr yrii icmy opam";

interface EmailData {
  to: string;
  subject: string;
  html: string;
}

// Add email to Firestore queue for processing by cloud functions
export const sendEmail = async (emailData: EmailData): Promise<boolean> => {
  try {
    await addDoc(collection(db, "emailQueue"), {
      ...emailData,
      from: EMAIL_USER,
      createdAt: serverTimestamp(),
      status: 'pending'
    });
    
    console.log("Email added to queue");
    return true;
  } catch (error) {
    console.error("Error adding email to queue:", error);
    return false;
  }
};

// Template for new musician registration notification to admin
export const getNewMusicianEmailTemplate = (musician: any) => {
  return {
    to: EMAIL_USER,
    subject: "New Musician Registration - SoundAlchemy",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #1a1a1a; color: #fff; border-radius: 10px;">
        <h1 style="color: #8b0000; text-align: center;">New Musician Registration</h1>
        <p style="margin-bottom: 20px;">A new musician has registered on SoundAlchemy and is awaiting verification:</p>
        
        <div style="background-color: #333; padding: 20px; border-radius: 5px; margin-bottom: 20px;">
          <h2 style="color: #fff; margin-top: 0;">${musician.fullName}</h2>
          <p><strong>Email:</strong> ${musician.email}</p>
          <p><strong>Contact:</strong> ${musician.contactNumber}</p>
          <p><strong>Country:</strong> ${musician.country}</p>
          <p><strong>Instrument:</strong> ${musician.instrumentType}</p>
          <p><strong>Singing Type:</strong> ${musician.singingType}</p>
          <p><strong>Music Culture:</strong> ${musician.musicCulture}</p>
          <p><strong>Bio:</strong> ${musician.bio}</p>
        </div>
        
        <p style="text-align: center;">
          <a href="https://soundalchemy-577b4.web.app/admin" style="display: inline-block; background-color: #1a237e; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
            Review in Admin Panel
          </a>
        </p>
      </div>
    `
  };
};

// Template for verification status update to musician
export const getVerificationStatusTemplate = (musician: any, isVerified: boolean) => {
  return {
    to: musician.email,
    subject: `Your SoundAlchemy Account ${isVerified ? 'Has Been Verified' : 'Verification Update'}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #1a1a1a; color: #fff; border-radius: 10px;">
        <h1 style="color: ${isVerified ? '#10B981' : '#8b0000'}; text-align: center;">
          ${isVerified ? 'Congratulations!' : 'Account Update'}
        </h1>
        
        <p style="margin-bottom: 20px; text-align: center; font-size: 18px;">
          ${isVerified 
            ? 'Your SoundAlchemy account has been verified! You now have full access to all platform features.' 
            : 'Your SoundAlchemy account verification is still in progress. Our team is reviewing your information.'}
        </p>
        
        ${isVerified ? `
        <div style="background-color: #0f3d3e; padding: 20px; border-radius: 5px; margin-bottom: 20px; text-align: center;">
          <h2 style="color: #fff; margin-top: 0;">What's Next?</h2>
          <p>You can now access all features of SoundAlchemy including:</p>
          <ul style="text-align: left;">
            <li>Connecting with musicians worldwide</li>
            <li>Participating in global collaborations</li>
            <li>Creating and joining music projects</li>
            <li>Accessing exclusive verified musician areas</li>
          </ul>
        </div>
        ` : ''}
        
        <p style="text-align: center;">
          <a href="https://soundalchemy-577b4.web.app/login" style="display: inline-block; background-color: #1a237e; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
            Login to Your Account
          </a>
        </p>
      </div>
    `
  };
};