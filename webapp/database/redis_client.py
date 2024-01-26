import redis

class RedisClient:
    def __init__(self, host='localhost', port=6379, db=0):
        self._connection = redis.Redis(host=host, port=port, db=db)

    def put(self, key, value):
        self._connection.set(key, value)

    def get(self, key):
        return self._connection.get(key)

    def exists(self, key):
        return self._connection.exists(key)

    def delete(self, key):
        return self._connection.delete(key)

    def close(self):
        self._connection.close()
