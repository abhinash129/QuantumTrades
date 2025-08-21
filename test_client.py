import asyncio
import json
import websockets

# This is the WebSocket URI for your FastAPI backend.
# Ensure the host and port match your running application.
WEBSOCKET_URI = "ws://localhost:8000/ws"

async def connect_and_listen():
    """
    Connects to the WebSocket endpoint and listens for real-time messages.

    This function demonstrates how a client "subscribes" to the data feed.
    It doesn't send any data; it only receives and prints it.
    """
    print(f"Attempting to connect to {WEBSOCKET_URI}...")

    # The 'try...except' block handles potential connection errors.
    try:
        # The 'async with' statement handles the connection and ensures it's closed properly.
        async with websockets.connect(WEBSOCKET_URI) as websocket:
            print("Successfully connected! Waiting for data...")

            # The script will now enter an infinite loop to listen for new messages.
            # Press Ctrl+C in your terminal to stop the script.
            while True:
                # Wait for the next message from the server.
                # The message is expected to be a JSON string.
                message = await websocket.recv()

                # Parse the JSON string into a Python dictionary.
                data = json.loads(message)

                # Print the received data in a nicely formatted way.
                print("--- New Real-Time Message Received ---")
                print(json.dumps(data, indent=2))
                print("--------------------------------------")

    except ConnectionRefusedError:
        print("Connection refused. Please ensure your FastAPI backend is running.")
    except Exception as e:
        print(f"An unexpected error occurred: {e}")

if __name__ == "__main__":
    # The asyncio.run() function handles the event loop and runs the main coroutine.
    asyncio.run(connect_and_listen())
