from aiohttp import web
import json
import socketio


class SocketServer:
    sio = socketio.AsyncServer(async_mode='aiohttp', cors_allowed_origins='*')

    def __init__(self):
        pass

    @staticmethod
    async def initialise():
        app = web.Application()
        SocketServer.sio.attach(app)
        return app

    @staticmethod
    @sio.event
    async def client_connected(sid, data):
        print('Client Connected', sid, data)
        await SocketServer.sio.save_session(sid, {'username': data['username']})

        # Broadcast to all Clients (If Required)
        new_data = {
            "type": "enter",
            "username": data['username'],
            "text": "joined the chat"
        }
        await SocketServer.send_message(new_data)

    @staticmethod
    @sio.event
    async def client_disconnected(sid):
        print('Client Disconnected', sid)
        session = await SocketServer.sio.get_session(sid)

        # Broadcast to all Clients (If Required)
        new_data = {
            "type": "exit",
            "username": session['username'],
            "text": "left the chat"
        }
        await SocketServer.send_message(new_data)

        # After Sending message, disconnect client
        await SocketServer.sio.disconnect(sid)

    @staticmethod
    @sio.event
    async def client_response(sid, data):
        print('Client Response', sid, data)
        session = await SocketServer.sio.get_session(sid)

        # Broadcast to all Clients (If Required)
        new_data = {
            "type": "chat",
            "username": session['username'],
            "text": data
        }
        await SocketServer.send_message(new_data)

    @staticmethod
    async def send_message(data, skip_id=None):
        print('sending msg:: ' + str(data))
        await SocketServer.sio.emit(event='server_response', data=json.dumps(data), skip_sid=skip_id)


# Starting Server
web.run_app(SocketServer.initialise(), port=3000)
