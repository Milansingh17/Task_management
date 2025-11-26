from urllib.parse import parse_qs

from channels.db import database_sync_to_async
from channels.generic.websocket import AsyncJsonWebsocketConsumer
from rest_framework_simplejwt.authentication import JWTAuthentication


class TaskConsumer(AsyncJsonWebsocketConsumer):
    """WebSocket consumer that streams per-user task updates."""

    async def connect(self):
        self.user = await self._authenticate_user()
        if not self.user or not self.channel_layer:
            await self.close(code=4401)
            return

        self.group_name = f'user_tasks_{self.user.id}'
        await self.channel_layer.group_add(self.group_name, self.channel_name)
        await self.accept()
        await self.send_json({
            'event': 'connected',
            'data': {'message': 'Realtime connection established.'}
        })

    async def disconnect(self, code):
        if getattr(self, 'group_name', None) and self.channel_layer:
            await self.channel_layer.group_discard(self.group_name, self.channel_name)

    async def receive_json(self, content, **kwargs):
        if content.get('type') == 'ping':
            await self.send_json({'event': 'pong'})

    async def task_event(self, event):
        await self.send_json({
            'event': event.get('event'),
            'data': event.get('data'),
        })

    async def _authenticate_user(self):
        query_string = self.scope.get('query_string', b'').decode()
        params = parse_qs(query_string)
        token = params.get('token', [None])[0]

        if not token:
            return None

        authenticator = JWTAuthentication()
        try:
            validated_token = authenticator.get_validated_token(token)
            user = await database_sync_to_async(authenticator.get_user)(validated_token)
            return user
        except Exception:
            return None

