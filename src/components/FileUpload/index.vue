<template>
  <view class="file-upload">
    <view class="file-list-grid">
      <view
        v-for="(file, index) in fileListWithUpload"
        :key="index"
        class="file-grid-item"
        @click="file.isUpload ? chooseFile() : previewMedia(index)"
      >
        <!-- 上传按钮 -->
        <template v-if="file.isUpload">
          <view class="upload-placeholder">
            <text class="upload-icon">+</text>
            <text class="upload-text">{{ placeholder }}</text>
          </view>
        </template>

        <!-- 已上传文件 -->
        <template v-else>
          <image
            v-if="file.type === 'image'"
            :src="file.url"
            mode="aspectFill"
            class="media-thumb"
          />

          <view v-else-if="file.type === 'video'" class="media-thumb video-thumb">
            <video
              :src="file.url"
              class="video-player"
              :controls="false"
              :muted="true"
              :show-center-play-btn="false"
              :show-fullscreen-btn="false"
              :show-play-btn="false"
              :show-progress="false"
              object-fit="cover"
            />
            <view class="video-mask">
              <text class="play-icon">▶</text>
            </view>
          </view>

          <view v-if="!disabled" class="delete-btn" @click.stop="deleteFile(index)">
            <text class="delete-icon">×</text>
          </view>
        </template>
      </view>
    </view>

    <!-- 视频预览弹窗 -->
    <view v-if="showVideo" class="video-modal" @click="closeVideo">
      <video :src="currentVideoUrl" controls autoplay class="video-modal-player" @click.stop />
    </view>
  </view>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { uploadApi } from '@/api/upload.js';

const props = defineProps({
  placeholder: { type: String, default: '上传' },
  modelValue: { type: Array, default: () => [] },
  maxCount: { type: Number, default: 9 },
  accept: { type: String, default: 'image' }, // image | video | image,video
  sizeType: { type: Array, default: () => ['original', 'compressed'] },
  sourceType: { type: Array, default: () => ['album', 'camera'] },
  uploadUrl: { type: String, default: '/api/upload' },
  disabled: { type: Boolean, default: false },
  maxSize: { type: Number, default: 10 * 1024 * 1024 }, // 10MB
});

const emit = defineEmits(['update:modelValue', 'change', 'success', 'error']);

const fileList = ref([]);
const showVideo = ref(false);
const currentVideoUrl = ref('');

// 双向绑定
watch(
  () => props.modelValue,
  (val) => {
    if (JSON.stringify(fileList.value) !== JSON.stringify(val)) {
      fileList.value = [...val];
    }
  },
  { immediate: true, deep: true }
);

watch(
  fileList,
  (val) => {
    emit('update:modelValue', [...val]);
    emit('change', [...val]);
  },
  { deep: true }
);

// 文件列表 + 上传按钮
const fileListWithUpload = computed(() => {
  if (!props.disabled && fileList.value.length < props.maxCount) {
    return [...fileList.value, { isUpload: true }];
  }
  return [...fileList.value];
});

// 选择文件
const chooseFile = () => {
  if (props.disabled) return;

  const remaining = props.maxCount - fileList.value.length;
  if (remaining <= 0) {
    uni.showToast({ title: `最多上传 ${props.maxCount} 个`, icon: 'none' });
    return;
  }

  const mediaType = props.accept.includes(',')
    ? ['image', 'video']
    : props.accept === 'video'
      ? ['video']
      : ['image'];

  uni.chooseMedia({
    count: remaining,
    mediaType,
    sourceType: props.sourceType,
    sizeType: props.sizeType,
    success: (res) => {
      const files = res.tempFiles.map((f) => ({
        tempPath: f.tempFilePath,
        name: f.tempFilePath.split('/').pop(),
        size: f.size,
        type: f.fileType,
      }));

      // 检查大小
      const oversized = files.filter((f) => f.size > props.maxSize);
      if (oversized.length > 0) {
        uni.showToast({
          title: `文件超过 ${Math.round(props.maxSize / 1024 / 1024)}MB`,
          icon: 'none',
        });
        return;
      }

      files.forEach((file) => handleUpload(file));
    },
  });
};

// 上传文件（复用 uploadApi）
const handleUpload = async (file) => {
  try {
    const res = await uploadApi.upload(file.tempPath, {
      url: props.uploadUrl,
      loadingText: '上传中...',
    });

    fileList.value.push({
      url: res.data,
      type: file.type,
      name: file.name,
    });

    emit('success', res.data);
  } catch (error) {
    emit('error', error);
  }
};

// 删除文件
const deleteFile = (index) => {
  if (!props.disabled) {
    fileList.value.splice(index, 1);
  }
};

// 预览
const previewMedia = (index) => {
  const file = fileList.value[index];

  if (file.type === 'image') {
    const urls = fileList.value.filter((f) => f.type === 'image').map((f) => f.url);
    uni.previewImage({ urls, current: urls.indexOf(file.url) });
  } else if (file.type === 'video') {
    currentVideoUrl.value = file.url;
    showVideo.value = true;
  }
};

const closeVideo = () => {
  showVideo.value = false;
  currentVideoUrl.value = '';
};
</script>

<style lang="scss" scoped>
.file-upload {
  .file-list-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 20rpx;
  }

  .file-grid-item {
    position: relative;
    aspect-ratio: 1;
    border-radius: 8rpx;
    overflow: hidden;
    background: #f5f5f5;
  }

  .upload-placeholder {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    border: 2rpx dashed #ddd;
    border-radius: 8rpx;
    background: #fafafa;

    .upload-icon {
      font-size: 48rpx;
      color: #999;
      line-height: 1;
    }

    .upload-text {
      font-size: 22rpx;
      color: #999;
      margin-top: 8rpx;
    }
  }

  .media-thumb {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .video-thumb {
    position: relative;

    .video-player {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .video-mask {
      position: absolute;
      inset: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(0, 0, 0, 0.3);

      .play-icon {
        font-size: 40rpx;
        color: #fff;
      }
    }
  }

  .delete-btn {
    position: absolute;
    top: 0;
    right: 0;
    width: 40rpx;
    height: 40rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(0, 0, 0, 0.5);
    border-radius: 0 8rpx 0 8rpx;

    .delete-icon {
      font-size: 28rpx;
      color: #fff;
      line-height: 1;
    }
  }

  .video-modal {
    position: fixed;
    inset: 0;
    z-index: 9999;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(0, 0, 0, 0.8);

    .video-modal-player {
      width: 90vw;
      max-height: 70vh;
      border-radius: 12rpx;
    }
  }
}
</style>
