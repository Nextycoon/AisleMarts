import secrets
import base64
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.backends import default_backend
import os
from typing import Tuple, Optional
import json
import logging

logger = logging.getLogger(__name__)

class EncryptionService:
    """Handles message encryption/decryption with AES-256-GCM"""
    
    def __init__(self):
        self.algorithm = "AES-256-GCM"
        
    def generate_key(self) -> bytes:
        """Generate a new 256-bit encryption key"""
        return AESGCM.generate_key(bit_length=256)
    
    def generate_nonce(self) -> bytes:
        """Generate a new random nonce for encryption"""
        return secrets.token_bytes(12)  # 96-bit nonce for GCM
    
    def encrypt_message(self, plaintext: str, key: bytes, nonce: bytes) -> bytes:
        """Encrypt a message using AES-256-GCM"""
        try:
            aesgcm = AESGCM(key)
            ciphertext = aesgcm.encrypt(nonce, plaintext.encode('utf-8'), None)
            return ciphertext
        except Exception as e:
            logger.error(f"Encryption failed: {str(e)}")
            raise
    
    def decrypt_message(self, ciphertext: bytes, key: bytes, nonce: bytes) -> str:
        """Decrypt a message using AES-256-GCM"""
        try:
            aesgcm = AESGCM(key)
            plaintext_bytes = aesgcm.decrypt(nonce, ciphertext, None)
            return plaintext_bytes.decode('utf-8')
        except Exception as e:
            logger.error(f"Decryption failed: {str(e)}")
            raise
    
    def wrap_key(self, key: bytes, master_key: Optional[bytes] = None) -> str:
        """Wrap/encrypt a key for secure storage"""
        if master_key is None:
            # Fallback to environment-based wrapping
            master_key_b64 = os.getenv("DM_MASTER_KEY")
            if not master_key_b64:
                # Generate a master key for development
                master_key = self.generate_key()
                logger.warning("Using ephemeral master key - not suitable for production")
            else:
                master_key = base64.b64decode(master_key_b64)
        
        nonce = self.generate_nonce()
        wrapped = self.encrypt_message(base64.b64encode(key).decode(), master_key, nonce)
        
        # Combine nonce + wrapped key and encode as base64
        combined = nonce + wrapped
        return base64.b64encode(combined).decode()
    
    def unwrap_key(self, wrapped_key: str, master_key: Optional[bytes] = None) -> bytes:
        """Unwrap/decrypt a key from secure storage"""
        if master_key is None:
            master_key_b64 = os.getenv("DM_MASTER_KEY")
            if not master_key_b64:
                # Use the same ephemeral key (not suitable for production)
                master_key = self.generate_key()
                logger.warning("Using ephemeral master key - key unwrap may fail")
            else:
                master_key = base64.b64decode(master_key_b64)
        
        # Decode and split nonce + wrapped key
        combined = base64.b64decode(wrapped_key)
        nonce = combined[:12]  # First 12 bytes are nonce
        wrapped = combined[12:]  # Rest is wrapped key
        
        key_b64 = self.decrypt_message(wrapped, master_key, nonce)
        return base64.b64decode(key_b64)
    
    def generate_key_id(self) -> str:
        """Generate a unique key ID"""
        return secrets.token_hex(16)

# Global encryption service instance
encryption_service = EncryptionService()