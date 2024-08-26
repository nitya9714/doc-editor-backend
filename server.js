import { Server } from "socket.io";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from './firebase.js';



const PORT = process.env.PORT || 3002;

const io = new Server(PORT, {
    cors: {
        origin: 'http://localhost:3000',
        methods: ['GET', 'POST']
    }
});

io.on('connection', socket => {

    socket.on('get-document', async documentId => {

        const docRef = doc(db, "docs", documentId);

        const docSnap = await getDoc(docRef);
        socket.join(documentId);
        socket.emit('load-document', docSnap.data().text);

        socket.on('send-changes', delta => {
            socket.broadcast.to(documentId).emit('receive-changes', delta);
        });

        socket.on('save-document', async data => {
            const DocsRef = doc(db, "docs", documentId);
            await updateDoc(DocsRef, {
                text: data
            })
        })
    })


});