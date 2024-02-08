import redis
import json

# Connect to Redis instance
redis_client = redis.StrictRedis(host='localhost', port=6379, db=0, decode_responses=True)

def write_flow(flow_id, flow_data):
    """
    Write a flow object into the Redis database.

    :param flow_id: The unique identifier for the flow.
    :param flow_data: The flow data object to store.
    """
    # Serialize flow_data to a string (assuming it's a dictionary)
    flow_data_str = json.dumps(flow_data)
    # Store the serialized data in Redis, using flow_id as the key
    return redis_client.set(flow_id, flow_data_str)

def get_flow(flow_id):
    """
    Retrieve a flow object from the Redis database by flow_id.

    :param flow_id: The unique identifier for the flow.
    :return: The flow data object if found, else None.
    """
    # Retrieve the serialized data from Redis
    flow_data_str = redis_client.get(flow_id)
    if flow_data_str:
        # Deserialize the string back to a dictionary
        return json.loads(flow_data_str)
    else:
        return None
