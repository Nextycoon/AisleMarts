import React, { useRef, useEffect } from "react";
import { View, Text, Image, Dimensions } from "react-native";
import { Video, ResizeMode } from "expo-av";

const { width, height } = Dimensions.get('window');

type Story = { 
  id: string; 
  mediaUrl: string; 
  type: "image" | "video";
  __visible?: boolean;
};

interface StoryCardProps {
  story: Story;
}

export const StoryCard: React.FC<StoryCardProps> = ({ story }) => {
  const videoRef = useRef<Video>(null);

  // Handle video play/pause based on visibility
  useEffect(() => {
    if (videoRef.current && story.type === "video") {
      if (story.__visible) {
        videoRef.current.playAsync().catch(console.warn);
      } else {
        videoRef.current.pauseAsync().catch(console.warn);
      }
    }
  }, [story.__visible, story.type]);

  const commonStyle = {
    width,
    height,
    backgroundColor: '#1A1A1A',
    justifyContent: 'center',
    alignItems: 'center'
  } as const;

  const mediaStyle = {
    width: width * 0.9,
    height: height * 0.8,
    borderRadius: 12,
    backgroundColor: '#333'
  } as const;

  const overlayStyle = {
    position: 'absolute',
    bottom: 60,
    left: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 8
  } as const;

  return (
    <View style={commonStyle}>
      {story.type === "image" ? (
        <Image 
          source={{ uri: story.mediaUrl }}
          style={mediaStyle}
          resizeMode={ResizeMode.COVER}
        />
      ) : (
        <Video
          ref={videoRef}
          source={{ uri: story.mediaUrl }}
          style={mediaStyle}
          resizeMode={ResizeMode.COVER}
          shouldPlay={story.__visible === true}
          isLooping
          useNativeControls={false}
          isMuted={false} // Allow audio by default
        />
      )}
      
      <View style={overlayStyle}>
        <Text style={{ 
          color: '#fff', 
          fontSize: 14,
          fontWeight: '500'
        }}>
          Story {story.id}
        </Text>
        <Text style={{ 
          color: '#ccc', 
          fontSize: 12,
          marginTop: 2
        }}>
          {story.type === 'video' ? '📹' : '📸'} {story.type.toUpperCase()}
          {story.__visible ? ' 👁️' : ''}
        </Text>
      </View>
    </View>
  );
};

export default StoryCard;