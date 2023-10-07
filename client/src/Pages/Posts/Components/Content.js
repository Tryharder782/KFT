import { observer } from 'mobx-react-lite';
import React, { useEffect, useRef, useState } from 'react';
import { getMultipleUsers } from '../../../http/usersApi';
import Post from '../../../Components/Post';
import { getPosts } from '../../../http/postsApi';

const Content = observer(({zoomMedia, displayedPosts, posts, isLoading, userList, socket, socketConnect, handleLike, setMessageTextHandler}) => {

  const postsRef = useRef(null)
  
  return (
    <div className='content' ref={postsRef}>
      {!isLoading &&
        displayedPosts.map(p => (
          <Post
            parentRef={postsRef}
            socket={socket}
            socketConnect={socketConnect}
            handleLike={handleLike}
            setMessageTextHandler={setMessageTextHandler}
            getMultipleUsers={getMultipleUsers}
            author={userList.find(u => u.id === p.authorId)}
            postProp={p}
            key={p.id}
          />
        ))}
    </div>
  );
});

export default Content;
