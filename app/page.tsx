// @ts-nocheck
"use client";

import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { LiveKitRoom, VideoConference, ControlBar, useRoomContext } from '@livekit/components-react';
import { RoomEvent } from 'livekit-client';
import '@livekit/components-styles';

function Icon({ name, className = 'h-5 w-5' }) {
  const icons = {
    video: '📹',
    videoOff: '🚫',
    mic: '🎙️',
    micOff: '🔇',
    message: '💬',
    bell: '🔔',
    search: '🔎',
    userPlus: '➕',
    users: '👥',
    live: '🔴',
    sparkles: '✨',
    heart: '💜',
    send: '➤',
    plus: '+',
    phoneOff: '📞',
    settings: '⚙️',
    crown: '👑',
    flame: '🔥',
    chevronRight: '›',
    close: '×',
    camera: '📸',
    wand: '🪄',
    lock: '🔒',
    globe: '🌍',
    copy: '🔗',
    shield: '🛡️',
    gift: '🎁',
    music: '🎵',
    game: '🎮',
    eye: '👀',
  };

  return (
    <span aria-hidden="true" className={`inline-flex shrink-0 items-center justify-center leading-none ${className}`}>
      {icons[name] || '•'}
    </span>
  );
}

const initialRooms = [
  {
    id: 1,
    title: 'Late Night Vibes',
    topic: 'Music, chill, good energy',
    host: 'Mia',
    viewers: 18,
    gradient: 'from-fuchsia-500 via-violet-500 to-cyan-500',
    avatars: ['M', 'J', 'A', 'T'],
    privacy: 'Public',
    category: 'Music',
    live: true,
  },
  {
    id: 2,
    title: 'Gaming Squad',
    topic: 'Warzone + laughs',
    host: 'Jay',
    viewers: 11,
    gradient: 'from-cyan-500 via-blue-500 to-indigo-500',
    avatars: ['J', 'R', 'N', 'K'],
    privacy: 'Friends',
    category: 'Gaming',
    live: true,
  },
  {
    id: 3,
    title: 'Study + Hangout',
    topic: 'Quiet room with chat',
    host: 'Lena',
    viewers: 7,
    gradient: 'from-purple-500 via-pink-500 to-orange-400',
    avatars: ['L', 'S', 'D'],
    privacy: 'Public',
    category: 'Chill',
    live: true,
  },
];

const initialFriends = [
  { name: 'Zara', status: 'In a room', online: true, vibe: 'creative', friend: true },
  { name: 'Noah', status: 'Online', online: true, vibe: 'gaming', friend: true },
  { name: 'Ava', status: 'Away', online: false, vibe: 'music', friend: true },
  { name: 'Rico', status: 'Live now', online: true, vibe: 'funny', friend: true },
  { name: 'Sami', status: 'Online', online: true, vibe: 'chill', friend: false },
];

const messagesSeed = [
  { user: 'Mia', text: 'Welcomeee 💜' },
  { user: 'Jay', text: 'Who is adding songs next?' },
  { user: 'Lena', text: 'This app looks fire ngl 🔥' },
];

const reactions = ['🔥', '💜', '😂', '✨', '🎵', '😍'];
const interests = ['Music', 'Gaming', 'Night talks', 'Content', 'Style', 'Chill', 'Rap', 'Memes'];

function runSmokeTests() {
  console.assert(initialRooms.length >= 3, 'Expected at least 3 live rooms.');
  console.assert(initialFriends.some((friend) => friend.online), 'Expected at least one online friend.');
  console.assert(reactions.includes('🔥'), 'Expected fire reaction to exist.');
  console.assert(messagesSeed.length > 0, 'Expected starter chat messages.');
  console.assert(interests.length >= 4, 'Expected selectable interests.');
  console.assert(initialRooms.every((room) => room.title && room.topic), 'Expected every room to have a title and topic.');
}

runSmokeTests();

function makeId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function getDeviceId() {
  if (typeof window === 'undefined') return 'server';

  const storageKey = 'viberoom-device-id';
  let deviceId = window.localStorage.getItem(storageKey);

  if (!deviceId) {
    deviceId = Math.random().toString(36).slice(2, 10);
    window.localStorage.setItem(storageKey, deviceId);
  }

  return deviceId;
}

function FloatingReaction({ emoji, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.8, x: 0 }}
      animate={{ opacity: [0, 1, 1, 0], y: -120, scale: [0.8, 1.2, 1, 0.9], x: [0, index % 2 === 0 ? 20 : -20, 0] }}
      transition={{ duration: 2.2, ease: 'easeOut' }}
      className="pointer-events-none absolute bottom-28 right-6 text-3xl"
      style={{ right: `${20 + index * 18}px` }}
    >
      {emoji}
    </motion.div>
  );
}

function GlowOrb({ className }) {
  return <div className={`absolute rounded-full blur-3xl opacity-30 ${className}`} />;
}

function TopHeader({ title, subtitle, action }) {
  return (
    <div className="relative z-10 flex items-center justify-between px-4 pb-3 pt-5">
      <div>
        <div className="text-xl font-bold text-white">{title}</div>
        <div className="text-sm text-white/60">{subtitle}</div>
      </div>
      {action}
    </div>
  );
}

function AuthScreen({ onEnter }) {
  const [username, setUsername] = useState('Lil Legend T');
  const [handle, setHandle] = useState('legendvibes');

  const start = () => {
    const safeName = username.trim() || 'New Friend';
    const safeHandle = handle.trim().replace(/\s+/g, '').toLowerCase() || 'newvibe';
    onEnter({ name: safeName, handle: safeHandle, bio: 'Music lover · late night talks · creative energy', selectedInterests: ['Music', 'Rap', 'Chill'] });
  };

  return (
    <div className="relative flex min-h-screen flex-col justify-between overflow-hidden px-5 py-8">
      <GlowOrb className="-left-20 top-10 h-56 w-56 bg-fuchsia-500/40" />
      <GlowOrb className="right-0 top-44 h-44 w-44 bg-cyan-500/30" />
      <div className="relative z-10">
        <Badge className="mb-5 rounded-full border-0 bg-white/10 px-4 py-2 text-white">
          <Icon name="sparkles" className="mr-2 h-4 w-4 text-xs" /> Social live rooms
        </Badge>
        <h1 className="max-w-sm text-5xl font-black leading-[0.95] tracking-tight text-white">Meet friends. Go live. Catch the vibe.</h1>
        <p className="mt-4 max-w-xs text-base text-white/65">A polished Yubo-style prototype with profiles, live rooms, chat, reactions, invites, and a group-call layout.</p>
      </div>

      <div className="relative z-10 rounded-[34px] border border-white/10 bg-white/5 p-5 backdrop-blur-2xl">
        <div className="mb-4 text-lg font-bold text-white">Create your profile</div>
        <div className="space-y-3">
          <div>
            <div className="mb-2 text-sm text-white/60">Display name</div>
            <Input value={username} onChange={(e) => setUsername(e.target.value)} className="rounded-2xl border-white/10 bg-white/5 text-white placeholder:text-white/35" />
          </div>
          <div>
            <div className="mb-2 text-sm text-white/60">Username</div>
            <Input value={handle} onChange={(e) => setHandle(e.target.value)} className="rounded-2xl border-white/10 bg-white/5 text-white placeholder:text-white/35" />
          </div>
        </div>
        <Button onClick={start} className="mt-5 w-full rounded-full bg-white py-6 text-base font-bold text-black hover:bg-white/90">
          Enter app <Icon name="chevronRight" className="ml-2 h-5 w-5 text-xl" />
        </Button>
      </div>
    </div>
  );
}

function RoomCard({ room, onJoin, onCopyInvite }) {
  return (
    <motion.div whileHover={{ y: -4 }} whileTap={{ scale: 0.98 }}>
      <Card className="overflow-hidden rounded-3xl border-white/10 bg-white/5 backdrop-blur-xl">
        <CardContent className="p-0">
          <div className={`relative h-40 bg-gradient-to-br ${room.gradient}`}>
            <div className="absolute inset-0 bg-black/20" />
            <div className="absolute left-4 top-4 flex items-center gap-2">
              <Badge className="rounded-full border-0 bg-red-500 text-white">
                <Icon name="live" className="mr-1 h-3 w-3 text-[10px]" /> LIVE
              </Badge>
              <Badge className="rounded-full border-white/20 bg-black/25 text-white">
                <Icon name="users" className="mr-1 h-3 w-3 text-[10px]" /> {room.viewers}
              </Badge>
              <Badge className="rounded-full border-white/20 bg-black/25 text-white">
                <Icon name={room.privacy === 'Public' ? 'globe' : 'lock'} className="mr-1 h-3 w-3 text-[10px]" /> {room.privacy}
              </Badge>
            </div>

            <div className="absolute bottom-4 left-4 right-4">
              <div className="mb-2 flex -space-x-2">
                {room.avatars.map((a, i) => (
                  <Avatar key={i} className="border-2 border-white/70">
                    <AvatarFallback className="bg-white/25 text-white">{a}</AvatarFallback>
                  </Avatar>
                ))}
              </div>
              <div className="text-lg font-semibold text-white">{room.title}</div>
              <div className="text-sm text-white/80">{room.topic}</div>
            </div>
          </div>

          <div className="flex items-center justify-between p-4">
            <div>
              <div className="text-sm text-white/50">Hosted by {room.host}</div>
              <div className="font-medium text-white">#{room.category}</div>
            </div>
            <div className="flex gap-2">
              <Button onClick={() => onCopyInvite(room)} variant="secondary" className="rounded-full border-0 bg-white/10 text-white hover:bg-white/15">
                <Icon name="copy" className="h-4 w-4 text-xs" />
              </Button>
              <Button onClick={() => onJoin(room)} className="rounded-full bg-white text-black hover:bg-white/90">
                Join
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function FriendRow({ friend, onInvite, onAddFriend }) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 p-3 backdrop-blur-xl">
      <div className="flex items-center gap-3">
        <div className="relative">
          <Avatar className="h-12 w-12 ring-2 ring-white/10">
            <AvatarFallback className="bg-gradient-to-br from-fuchsia-500 to-cyan-500 text-white">
              {friend.name[0]}
            </AvatarFallback>
          </Avatar>
          <span className={`absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-[#09090f] ${friend.online ? 'bg-emerald-400' : 'bg-zinc-500'}`} />
        </div>
        <div>
          <div className="font-medium text-white">{friend.name}</div>
          <div className="text-sm text-white/50">{friend.status} · {friend.vibe}</div>
        </div>
      </div>
      {friend.friend ? (
        <Button onClick={() => onInvite(friend)} variant="secondary" className="rounded-full border-0 bg-white/10 text-white hover:bg-white/15">
          <Icon name="userPlus" className="mr-2 h-4 w-4 text-xs" /> Invite
        </Button>
      ) : (
        <Button onClick={() => onAddFriend(friend.name)} className="rounded-full bg-white text-black hover:bg-white/90">
          Add
        </Button>
      )}
    </div>
  );
}

function NavItem({ label, active, icon, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-1 flex-col items-center gap-1 rounded-2xl py-2 text-xs transition ${active ? 'bg-white/10 text-white' : 'text-white/45 hover:text-white/70'}`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

function HomeScreen({ rooms, query, setQuery, onJoinRoom, onOpenCreate, onCopyInvite, notice }) {
  const filteredRooms = rooms.filter((room) => `${room.title} ${room.topic} ${room.category} ${room.host}`.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="pb-28">
      <TopHeader
        title="Hangout"
        subtitle="Find your people and go live"
        action={
          <button className="relative rounded-full border border-white/10 bg-white/5 p-3 text-white/80" aria-label="Notifications">
            <Icon name="bell" />
            <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-fuchsia-400" />
          </button>
        }
      />

      <div className="px-4">
        {notice && <div className="mb-3 rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-100">{notice}</div>}

        <div className="mb-4 flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur-xl">
          <Icon name="search" className="h-4 w-4 text-sm text-white/40" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent text-sm text-white outline-none placeholder:text-white/35"
            placeholder="Search rooms, friends, vibes..."
          />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative mb-5 overflow-hidden rounded-[28px] border border-white/10 bg-gradient-to-br from-fuchsia-600/40 via-violet-500/25 to-cyan-500/30 p-5"
        >
          <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-fuchsia-500/30 blur-3xl" />
          <div className="absolute -bottom-8 left-10 h-24 w-24 rounded-full bg-cyan-500/30 blur-3xl" />
          <Badge className="mb-3 rounded-full border-0 bg-white/15 text-white">
            <Icon name="sparkles" className="mr-1 h-3 w-3 text-[10px]" /> New vibe drop
          </Badge>
          <div className="max-w-[240px] text-2xl font-bold leading-tight text-white">Start a live room and bring your friends in.</div>
          <div className="mt-2 max-w-[270px] text-sm text-white/70">Video calls, chat, reactions, invite links, and a social feed that feels alive.</div>
          <div className="mt-4 flex gap-2">
            <Button onClick={onOpenCreate} className="rounded-full bg-white text-black hover:bg-white/90">
              <Icon name="plus" className="mr-2 h-4 w-4 text-lg" /> Create room
            </Button>
            <Button variant="secondary" className="rounded-full border-0 bg-white/10 text-white hover:bg-white/15">
              <Icon name="eye" className="mr-2 h-4 w-4 text-xs" /> Browse
            </Button>
          </div>
        </motion.div>

        <div className="mb-3 flex items-center justify-between">
          <div className="text-lg font-semibold text-white">Trending live rooms</div>
          <button className="text-sm text-white/55">{filteredRooms.length} live</button>
        </div>

        <div className="space-y-4">
          {filteredRooms.map((room) => (
            <RoomCard key={room.id} room={room} onJoin={onJoinRoom} onCopyInvite={onCopyInvite} />
          ))}
          {filteredRooms.length === 0 && <div className="rounded-3xl border border-white/10 bg-white/5 p-6 text-center text-white/60">No rooms found. Try another search.</div>}
        </div>
      </div>
    </div>
  );
}

function FriendsScreen({ friends, onInvite, onAddFriend, notice }) {
  return (
    <div className="pb-28">
      <TopHeader
        title="Friends"
        subtitle="Who's around right now"
        action={<button className="rounded-full border border-white/10 bg-white/5 p-3 text-white/80" aria-label="Search friends"><Icon name="search" /></button>}
      />
      <div className="space-y-3 px-4">
        {notice && <div className="rounded-2xl border border-cyan-400/20 bg-cyan-400/10 px-4 py-3 text-sm text-cyan-100">{notice}</div>}
        {friends.map((friend) => (
          <FriendRow key={friend.name} friend={friend} onInvite={onInvite} onAddFriend={onAddFriend} />
        ))}
      </div>
    </div>
  );
}

function ProfileScreen({ user, onUpdateUser }) {
  const [editing, setEditing] = useState(false);
  const [draftName, setDraftName] = useState(user.name);
  const [draftBio, setDraftBio] = useState(user.bio);
  const [selectedInterests, setSelectedInterests] = useState(user.selectedInterests);

  const save = () => {
    onUpdateUser({ ...user, name: draftName.trim() || user.name, bio: draftBio.trim() || user.bio, selectedInterests });
    setEditing(false);
  };

  const toggleInterest = (tag) => {
    setSelectedInterests((prev) => (prev.includes(tag) ? prev.filter((item) => item !== tag) : [...prev, tag]));
  };

  return (
    <div className="pb-28">
      <TopHeader
        title="Profile"
        subtitle={`@${user.handle}`}
        action={<button onClick={() => setEditing(!editing)} className="rounded-full border border-white/10 bg-white/5 p-3 text-white/80" aria-label="Settings"><Icon name="settings" /></button>}
      />

      <div className="px-4">
        <div className="relative overflow-hidden rounded-[30px] border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
          <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-r from-fuchsia-500/60 via-violet-500/50 to-cyan-500/50" />
          <div className="relative mt-12">
            <Avatar className="h-24 w-24 border-4 border-[#09090f] shadow-2xl">
              <AvatarFallback className="bg-gradient-to-br from-fuchsia-500 to-cyan-500 text-2xl text-white">{user.name[0]}</AvatarFallback>
            </Avatar>

            {!editing ? (
              <>
                <div className="mt-4 flex items-center gap-2">
                  <div className="text-2xl font-bold text-white">{user.name}</div>
                  <Badge className="rounded-full border-0 bg-amber-400/20 text-amber-200"><Icon name="crown" className="mr-1 h-3 w-3 text-[10px]" /> VIP</Badge>
                </div>
                <div className="mt-1 text-sm text-white/60">{user.bio}</div>
              </>
            ) : (
              <div className="mt-4 space-y-3">
                <Input value={draftName} onChange={(e) => setDraftName(e.target.value)} className="rounded-2xl border-white/10 bg-white/5 text-white" />
                <Input value={draftBio} onChange={(e) => setDraftBio(e.target.value)} className="rounded-2xl border-white/10 bg-white/5 text-white" />
              </div>
            )}

            <div className="mt-5 grid grid-cols-3 gap-3">
              {[
                ['128', 'Friends'],
                ['14', 'Rooms joined'],
                ['3.9k', 'Reactions'],
              ].map(([value, label]) => (
                <div key={label} className="rounded-2xl border border-white/10 bg-white/5 p-3 text-center">
                  <div className="text-lg font-semibold text-white">{value}</div>
                  <div className="text-xs text-white/45">{label}</div>
                </div>
              ))}
            </div>

            <div className="mt-5 flex gap-3">
              {editing ? (
                <>
                  <Button onClick={save} className="flex-1 rounded-full bg-white text-black hover:bg-white/90">Save</Button>
                  <Button onClick={() => setEditing(false)} variant="secondary" className="flex-1 rounded-full border-0 bg-white/10 text-white hover:bg-white/15">Cancel</Button>
                </>
              ) : (
                <>
                  <Button onClick={() => setEditing(true)} className="flex-1 rounded-full bg-white text-black hover:bg-white/90">Edit profile</Button>
                  <Button variant="secondary" className="flex-1 rounded-full border-0 bg-white/10 text-white hover:bg-white/15">Share</Button>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="mt-4 rounded-[28px] border border-white/10 bg-white/5 p-4">
          <div className="mb-3 text-base font-semibold text-white">Interests</div>
          <div className="flex flex-wrap gap-2">
            {interests.map((tag) => {
              const active = selectedInterests.includes(tag);
              return (
                <button key={tag} onClick={() => editing && toggleInterest(tag)} className={`rounded-full px-3 py-1 text-sm ${active ? 'bg-white text-black' : 'bg-white/10 text-white'}`}>
                  {tag}
                </button>
              );
            })}
          </div>
          {editing && <div className="mt-3 text-xs text-white/45">Tap interests to add or remove them.</div>}
        </div>
      </div>
    </div>
  );
}

function NotificationsScreen({ notifications }) {
  return (
    <div className="pb-28">
      <TopHeader title="Notifications" subtitle="Activity and invites" action={<Badge className="rounded-full border-0 bg-white/10 text-white">{notifications.length}</Badge>} />
      <div className="space-y-3 px-4">
        {notifications.map((item) => (
          <div key={item.id} className="rounded-3xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl">
            <div className="flex items-start gap-3">
              <div className="rounded-2xl bg-white/10 p-3"><Icon name={item.icon} /></div>
              <div>
                <div className="font-semibold text-white">{item.title}</div>
                <div className="mt-1 text-sm text-white/55">{item.body}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function CreateRoomModal({ open, onClose, onCreate }) {
  const [title, setTitle] = useState('Friday Night Energy');
  const [topic, setTopic] = useState('Music, laughs, and random chats');
  const [privacy, setPrivacy] = useState('Public');
  const [category, setCategory] = useState('Music');

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-40 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 50, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 240, damping: 22 }}
            className="absolute inset-x-4 bottom-6 z-50 rounded-[32px] border border-white/10 bg-[#11111a]/95 p-5 shadow-2xl"
          >
            <div className="mb-4 flex items-center justify-between">
              <div>
                <div className="text-xl font-bold text-white">Create a room</div>
                <div className="text-sm text-white/55">Set the vibe and start instantly</div>
              </div>
              <button onClick={onClose} className="rounded-full bg-white/10 p-2 text-white/75" aria-label="Close create room modal"><Icon name="close" className="h-4 w-4 text-lg" /></button>
            </div>

            <div className="space-y-3">
              <div>
                <div className="mb-2 text-sm text-white/65">Room title</div>
                <Input value={title} onChange={(e) => setTitle(e.target.value)} className="rounded-2xl border-white/10 bg-white/5 text-white placeholder:text-white/35" />
              </div>
              <div>
                <div className="mb-2 text-sm text-white/65">Topic</div>
                <Input value={topic} onChange={(e) => setTopic(e.target.value)} className="rounded-2xl border-white/10 bg-white/5 text-white placeholder:text-white/35" />
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                {['Public', 'Friends'].map((type) => (
                  <button key={type} onClick={() => setPrivacy(type)} className={`rounded-2xl border p-4 text-left text-white ${privacy === type ? 'border-white/25 bg-gradient-to-br from-fuchsia-500/20 to-violet-500/20' : 'border-white/10 bg-white/5'}`}>
                    <Icon name={type === 'Public' ? 'globe' : 'lock'} className="mb-3 h-5 w-5" />
                    <div className="font-medium">{type}</div>
                    <div className="text-sm text-white/55">{type === 'Public' ? 'Anyone can join' : 'Friends only'}</div>
                  </button>
                ))}
              </div>

              <div className="flex gap-2 overflow-x-auto pb-1">
                {['Music', 'Gaming', 'Chill', 'Rap', 'Memes'].map((item) => (
                  <button key={item} onClick={() => setCategory(item)} className={`whitespace-nowrap rounded-full px-4 py-2 text-sm ${category === item ? 'bg-white text-black' : 'bg-white/10 text-white'}`}>
                    #{item}
                  </button>
                ))}
              </div>
            </div>

            <Button onClick={() => onCreate({ title, topic, privacy, category })} className="mt-5 w-full rounded-full bg-white text-black hover:bg-white/90">
              <Icon name="wand" className="mr-2 h-4 w-4 text-sm" /> Go live now
            </Button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function ParticipantTile({ name, speaking, muted, cameraOff, gradient, isHost }) {
  return (
    <div className="relative h-44 overflow-hidden rounded-[24px] border border-white/10 bg-white/5">
      {!cameraOff ? (
        <div className={`absolute inset-0 bg-gradient-to-br ${gradient}`}>
          <div className="absolute inset-0 bg-black/25" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(255,255,255,0.22),transparent_35%)]" />
        </div>
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-zinc-800 to-zinc-900" />
      )}

      {cameraOff && (
        <div className="absolute inset-0 flex items-center justify-center">
          <Avatar className="h-20 w-20 border border-white/10">
            <AvatarFallback className="bg-white/10 text-2xl text-white">{name[0]}</AvatarFallback>
          </Avatar>
        </div>
      )}

      {isHost && <Badge className="absolute right-3 top-3 rounded-full border-0 bg-amber-400/20 text-amber-100"><Icon name="crown" className="mr-1 h-3 w-3 text-[10px]" /> Host</Badge>}

      <div className="absolute inset-x-3 bottom-3 flex items-center justify-between">
        <div className="rounded-full bg-black/30 px-3 py-1 text-sm text-white backdrop-blur-md">{name}</div>
        <div className="flex items-center gap-2">
          {speaking && <div className="h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-[0_0_16px_rgba(74,222,128,0.8)]" />}
          <div className="rounded-full bg-black/30 p-2 text-white backdrop-blur-md">
            {muted ? <Icon name="micOff" className="h-4 w-4 text-xs" /> : <Icon name="mic" className="h-4 w-4 text-xs" />}
          </div>
        </div>
      </div>
    </div>
  );
}

function LiveChatDock({ user }) {
  const room = useRoomContext();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([
    { id: 'welcome', user: 'System', text: 'Welcome to the live room 💜' },
  ]);

  React.useEffect(() => {
    if (!room) return;

    const decoder = new TextDecoder();
    const handleData = (payload, participant, _kind, topic) => {
      if (topic !== 'chat') return;
      try {
        const incoming = JSON.parse(decoder.decode(payload));
        setMessages((prev) => [...prev, incoming]);
      } catch (error) {
        console.error('Could not read chat message', error);
      }
    };

    room.on(RoomEvent.DataReceived, handleData);
    return () => room.off(RoomEvent.DataReceived, handleData);
  }, [room]);

  const sendMessage = async () => {
    if (!message.trim() || !room) return;

    const chatMessage = {
      id: makeId(),
      user: user.name,
      text: message.trim(),
      sentAt: Date.now(),
    };

    setMessages((prev) => [...prev, chatMessage]);
    setMessage('');

    const payload = new TextEncoder().encode(JSON.stringify(chatMessage));
    await room.localParticipant.publishData(payload, { reliable: true, topic: 'chat' });
  };

  return (
    <div className="h-screen bg-[#09090f]">
      <LiveKitRoom
        token={token}
        serverUrl={livekitUrl}
        connect={true}
        video={true}
        audio={true}
        onError={(error) => setConnectionError(error.message || 'LiveKit connection failed')}
        onDisconnected={(reason) => {
          if (reason) setConnectionError(`Disconnected: ${String(reason)}`);
        }}
      >
        <div className="h-full w-full overflow-y-auto snap-y snap-mandatory bg-[#09090f] p-3 pb-56
          [&_.lk-video-conference]:min-h-full [&_.lk-video-conference]:grid [&_.lk-video-conference]:grid-cols-2 lg:[&_.lk-video-conference]:grid-cols-4 [&_.lk-video-conference]:gap-3
          [&_.lk-participant-tile]:relative [&_.lk-participant-tile]:snap-start [&_.lk-participant-tile]:min-h-[34vh] lg:[&_.lk-participant-tile]:min-h-[28vh]
          [&_.lk-participant-tile:first-child]:col-span-2 lg:[&_.lk-participant-tile:first-child]:col-span-4 [&_.lk-participant-tile:first-child]:min-h-[62vh]
          [&_.lk-participant-tile]:overflow-hidden [&_.lk-participant-tile]:rounded-[32px] [&_.lk-participant-tile]:border [&_.lk-participant-tile]:border-white/10 [&_.lk-participant-tile]:bg-black [&_.lk-participant-tile]:shadow-2xl [&_.lk-participant-tile]:transition-all [&_.lk-participant-tile]:duration-300 [&_.lk-participant-tile]:ease-out
          [&_.lk-participant-tile:hover]:scale-[1.01] [&_.lk-participant-tile:hover]:border-white/30
          [&_.lk-participant-tile.lk-speaking]:border-emerald-300/90 [&_.lk-participant-tile.lk-speaking]:shadow-[0_0_36px_rgba(52,211,153,0.55)]
          [&_.lk-participant-tile.lk-local-participant]:border-fuchsia-300/90 [&_.lk-participant-tile.lk-local-participant]:shadow-[0_0_30px_rgba(217,70,239,0.45)]
          [&_.lk-participant-tile_video]:h-full [&_.lk-participant-tile_video]:w-full [&_.lk-participant-tile_video]:object-cover
          [&_.lk-participant-name]:absolute [&_.lk-participant-name]:left-4 [&_.lk-participant-name]:bottom-4 [&_.lk-participant-name]:rounded-full [&_.lk-participant-name]:bg-black/70 [&_.lk-participant-name]:px-3 [&_.lk-participant-name]:py-1.5 [&_.lk-participant-name]:text-sm [&_.lk-participant-name]:font-bold [&_.lk-participant-name]:text-white [&_.lk-participant-name]:backdrop-blur-md
          [&_.lk-control-bar]:hidden
          [&_.lk-chat]:hidden [&_.lk-chat-toggle]:hidden [&_[aria-label='Chat']]:hidden [&_[title='Chat']]:hidden
        ">
          <VideoConference />
        </div>

        <div className="fixed inset-x-0 bottom-36 z-[1100] flex justify-center px-3">
          <div className="rounded-full border border-white/10 bg-black/75 px-3 py-2 shadow-2xl backdrop-blur-2xl">
            <ControlBar controls={{ chat: false, settings: false }} />
          </div>
        </div>

        <div className="pointer-events-none absolute inset-x-0 top-4 z-50 flex items-center justify-between px-4">
          <button onClick={onLeave} className="pointer-events-auto rounded-full bg-red-500 px-4 py-2 text-sm font-bold text-white shadow-lg">
            Leave
          </button>
          <div className="rounded-full border border-white/10 bg-black/60 px-4 py-2 text-sm font-bold text-white backdrop-blur-xl">
            <Icon name="crown" className="mr-2 h-4 w-4 text-xs" /> Host: {room?.host || 'Host'}
          </div>
        </div>

        <div className="absolute bottom-44 right-4 z-50 flex flex-col gap-2">
          <button
            onClick={() => setHandRaised(!handRaised)}
            className={`rounded-full px-4 py-3 text-sm font-bold shadow-lg backdrop-blur-xl ${handRaised ? 'bg-amber-400 text-black' : 'bg-black/60 text-white'}`}
          >
            ✋ {handRaised ? 'Hand raised' : 'Raise hand'}
          </button>
          <button
            onClick={() => setRoomLocked(!roomLocked)}
            className={`rounded-full px-4 py-3 text-sm font-bold shadow-lg backdrop-blur-xl ${roomLocked ? 'bg-rose-500 text-white' : 'bg-black/60 text-white'}`}
          >
            {roomLocked ? '🔒 Locked' : '🔓 Lock room'}
          </button>
        </div>

        <LiveChatDock user={user} />
      </LiveKitRoom>
    </div>
  );
}

export default function App() {
  const [user, setUser] = useState(null);
  const [tab, setTab] = useState('home');
  const [inRoom, setInRoom] = useState(false);
  const [room, setRoom] = useState(null);
  const [rooms, setRooms] = useState(initialRooms);
  const [friends, setFriends] = useState(initialFriends);
  const [createOpen, setCreateOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [notice, setNotice] = useState('');
  const [notifications, setNotifications] = useState([
    { id: 1, icon: 'gift', title: 'Welcome bonus', body: 'Your profile is ready. Start your first room and invite friends.' },
    { id: 2, icon: 'music', title: 'Mia is live', body: 'Late Night Vibes is active right now.' },
    { id: 3, icon: 'game', title: 'Gaming Squad', body: 'Jay started a friends-only room.' },
  ]);

  const showNotice = (text) => {
    setNotice(text);
    setTimeout(() => setNotice(''), 2800);
  };

  const joinRoom = (selectedRoom) => {
    const newRoom = { ...selectedRoom, viewers: selectedRoom.viewers + 1 };
    setRoom(newRoom);
    setInRoom(true);
    if (typeof window !== 'undefined') {
      window.history.pushState({}, '', `/room/${newRoom.id}`);
    }
  };

  const createRoom = (newRoom) => {
    const safeTitle = newRoom.title.trim() || 'Untitled Room';
    const safeTopic = newRoom.topic.trim() || 'Open hangout';
    const roomData = {
      id: Date.now(),
      title: safeTitle,
      topic: safeTopic,
      privacy: newRoom.privacy,
      category: newRoom.category,
      host: 'You',
      viewers: 1,
      gradient: 'from-fuchsia-500 via-violet-500 to-cyan-500',
      avatars: [user.name[0], 'M', 'J'],
      live: true,
    };
    setRooms((prev) => [roomData, ...prev]);
    setRoom(roomData);
    setCreateOpen(false);
    setInRoom(true);
    if (typeof window !== 'undefined') {
      window.history.pushState({}, '', `/room/${roomData.id}`);
    }
    setNotifications((prev) => [{ id: Date.now(), icon: 'live', title: 'Room created', body: `${safeTitle} is now live.` }, ...prev]);
  };

  const copyInvite = (selectedRoom) => {
    const link = `${window.location.origin}/room/${selectedRoom?.id || room?.id || 'new'}`;
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(link).catch(() => {});
    }
    showNotice(`Invite link ready: ${link}`);
  };

  const inviteFriend = (friend) => {
    showNotice(`${friend.name} invited to your next room.`);
    setNotifications((prev) => [{ id: Date.now(), icon: 'userPlus', title: 'Invite sent', body: `${friend.name} got your room invite.` }, ...prev]);
  };

  const addFriend = (friendName) => {
    setFriends((prev) => prev.map((friend) => (friend.name === friendName ? { ...friend, friend: true, status: 'Friend added' } : friend)));
    showNotice(`${friendName} added as a friend.`);
  };

  React.useEffect(() => {
    if (typeof window === 'undefined' || !user) return;

    const path = window.location.pathname;
    const match = path.match(/^\/room\/(.+)/);
    if (!match) return;

    const id = decodeURIComponent(match[1]);
    const existing = rooms.find((r) => String(r.id) === id);
    const roomData = existing ?? {
      id,
      title: `Room ${id}`,
      topic: 'Live hangout',
      host: 'Host',
      viewers: 1,
      gradient: 'from-fuchsia-500 via-violet-500 to-cyan-500',
      avatars: [user.name[0]],
      privacy: 'Public',
      category: 'General',
      live: true,
    };

    setRoom(roomData);
    setInRoom(true);
  }, [user, rooms]);

  if (!user) {
    return (
      <div className="min-h-screen bg-[#09090f] text-white">
        <div className="relative mx-auto min-h-screen max-w-md overflow-hidden border-x border-white/5 bg-[radial-gradient(circle_at_top,_rgba(168,85,247,0.18),_transparent_35%),radial-gradient(circle_at_bottom_right,_rgba(34,211,238,0.14),_transparent_28%),linear-gradient(180deg,_#0a0a12_0%,_#09090f_100%)]">
          <AuthScreen onEnter={setUser} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#09090f] text-white">
      <div className="relative mx-auto min-h-screen max-w-md overflow-hidden border-x border-white/5 bg-[radial-gradient(circle_at_top,_rgba(168,85,247,0.18),_transparent_35%),radial-gradient(circle_at_bottom_right,_rgba(34,211,238,0.14),_transparent_28%),linear-gradient(180deg,_#0a0a12_0%,_#09090f_100%)]">
        <GlowOrb className="-left-16 top-14 h-44 w-44 bg-fuchsia-500/30" />
        <GlowOrb className="right-0 top-52 h-36 w-36 bg-cyan-500/20" />
        <GlowOrb className="left-12 bottom-24 h-36 w-36 bg-violet-500/20" />

        {!inRoom ? (
          <>
            {tab === 'home' && <HomeScreen rooms={rooms} query={query} setQuery={setQuery} onJoinRoom={joinRoom} onOpenCreate={() => setCreateOpen(true)} onCopyInvite={copyInvite} notice={notice} />}
            {tab === 'friends' && <FriendsScreen friends={friends} onInvite={inviteFriend} onAddFriend={addFriend} notice={notice} />}
            {tab === 'notifications' && <NotificationsScreen notifications={notifications} />}
            {tab === 'profile' && <ProfileScreen user={user} onUpdateUser={setUser} />}

            <CreateRoomModal open={createOpen} onClose={() => setCreateOpen(false)} onCreate={createRoom} />

            <div className="absolute inset-x-4 bottom-5 z-30 rounded-[28px] border border-white/10 bg-black/35 p-2 backdrop-blur-2xl">
 