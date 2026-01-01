# Connects facial hashes to the main DB

import os
import asyncpg
from typing import Optional
import hashlib

class DBBridge:
    """
    Bridge between facial recognition hashes and the main database
    Stores and retrieves face hash mappings to voter IDs
    """
    
    def __init__(self):
        self.db_host = os.getenv('DB_HOST', 'localhost')
        self.db_port = int(os.getenv('DB_PORT', 5432))
        self.db_name = os.getenv('DB_NAME', 'satya_db')
        self.db_user = os.getenv('DB_USER', 'satya_user')
        self.db_password = os.getenv('DB_PASSWORD', '')
        self.pool = None
    
    async def get_pool(self):
        """
        Get or create database connection pool
        """
        if self.pool is None:
            self.pool = await asyncpg.create_pool(
                host=self.db_host,
                port=self.db_port,
                database=self.db_name,
                user=self.db_user,
                password=self.db_password
            )
        return self.pool
    
    async def store_face_hash(self, voter_id: str, face_hash: str) -> bool:
        """
        Store face hash for a voter in the database
        
        Args:
            voter_id: Unique voter identifier
            face_hash: SHA-256 hash of face embedding
            
        Returns:
            True if successful, False otherwise
        """
        try:
            pool = await self.get_pool()
            async with pool.acquire() as conn:
                # Check if voter already has a face hash
                existing = await conn.fetchval(
                    "SELECT face_hash FROM voter_faces WHERE voter_id = $1",
                    voter_id
                )
                
                if existing:
                    # Update existing record
                    await conn.execute(
                        "UPDATE voter_faces SET face_hash = $1, updated_at = NOW() WHERE voter_id = $2",
                        face_hash, voter_id
                    )
                else:
                    # Insert new record
                    await conn.execute(
                        "INSERT INTO voter_faces (voter_id, face_hash, created_at, updated_at) VALUES ($1, $2, NOW(), NOW())",
                        voter_id, face_hash
                    )
                
                return True
        except Exception as e:
            print(f"Error storing face hash: {str(e)}")
            return False
    
    async def find_voter_by_face_hash(self, face_hash: str) -> Optional[str]:
        """
        Find voter ID by face hash
        
        Args:
            face_hash: SHA-256 hash of face embedding
            
        Returns:
            Voter ID if found, None otherwise
        """
        try:
            pool = await self.get_pool()
            async with pool.acquire() as conn:
                # Exact match first
                voter_id = await conn.fetchval(
                    "SELECT voter_id FROM voter_faces WHERE face_hash = $1",
                    face_hash
                )
                
                if voter_id:
                    return voter_id
                
                # TODO: Implement fuzzy matching for similar face hashes
                # This would require comparing embeddings with a similarity threshold
                # For now, return None if no exact match
                
                return None
                
        except Exception as e:
            print(f"Error finding voter by face hash: {str(e)}")
            return None
    
    async def delete_face_hash(self, voter_id: str) -> bool:
        """
        Delete face hash for a voter
        
        Args:
            voter_id: Unique voter identifier
            
        Returns:
            True if successful, False otherwise
        """
        try:
            pool = await self.get_pool()
            async with pool.acquire() as conn:
                await conn.execute(
                    "DELETE FROM voter_faces WHERE voter_id = $1",
                    voter_id
                )
                return True
        except Exception as e:
            print(f"Error deleting face hash: {str(e)}")
            return False
    
    async def close(self):
        """
        Close database connection pool
        """
        if self.pool:
            await self.pool.close()

