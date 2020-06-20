const express = require('express');
const db = require('../helper/db');
const mongo = require('mongodb');
const ObjectId = mongo.ObjectID;
const router = express.Router();

// load chat
router.get('/chat', async (req, res) => {
  try {
    if (!req.session.user) {
      res.render('./login.ejs');
      return;
    }

    const id = req.session.user._id;

    const chat = await db.get().collection('chats').findOne({
      participants: {$in: [id]},
    });

    if (chat) {
      req.session.chatroom = chat._id;
      chat.clientid = id;
    }

    // get sidebar
    const users = await getSidebar(id);

    res.render('./chat.ejs', {chats: chat, users: users});
  } catch (err) {
    console.log(err);
  }
});

// send message
router.post('/chat', async (req, res) => {
  try {
    const id = req.session.user._id;
    let chat = {};

    if (req.body.message.trim()) {
      const databaseData = {
        sender: id,
        content: req.body.message.trim(),
        time: new Date(),
      };

      // send to database
      await db.get()
          .collection('chats')
          .updateOne(
              {
                _id: ObjectId(req.session.chatroom),
              },
              {$push: {messages: databaseData}},
          );
      console.log(`send to: ${req.session.chatroom}`);
    }

    // rendering template
    // get chat
    if (req.session.chatroom) {
      chat = await db
          .get()
          .collection('chats')
          .findOne({
            _id: ObjectId(req.session.chatroom),
          });
    } else {
      chat = await db.get().collection('chats').findOne({
        participants: {$in: [id]},
      });
    }
    chat.clientid = id;

    // get sidebar
    const users = await getSidebar(id);

    res.render('./chat.ejs', {chats: chat, users: users});
  } catch (err) {
    console.log(err);
  }
});

// changechat
router.post('/changeChat', async (req, res) => {
  try {
    const id = req.session.user._id;
    const userId = req.body.changeChat;

    // get messages
    const chat = await db
        .get()
        .collection('chats')
        .findOne({
          participants: {
            $all: [userId, req.session.user._id],
          },
        });

    chat.clientid = id;
    req.session.chatroom = chat._id;

    // get sidebar
    const users = await getSidebar(id);

    res.render('./chat.ejs', {chats: chat, users: users});
  } catch (err) {
    console.log(err);
  }
});

// get users in sidebar
async function getSidebar(userId) {
  let users = {};
  const chats = await db
      .get()
      .collection('chats')
      .find({
        participants: {
          $in: [userId],
        },
      })
      .toArray();

  if (chats.length > 0) {
    const x = [];
    for (const i of chats) {
      for (const y of i.participants) {
        if (y != userId) {
          x.push(ObjectId(y));
        }
      }
    }

    users = await db
        .get()
        .collection('users')
        .find({
          _id: {$in: x, $ne: ObjectId(userId)},
        })
        .toArray();
  }

  return users;
}


module.exports = router;
