# 🗑️ **FREE DISK SPACE - DELETE DOCKER**

## **Current Situation:**
- **Disk usage:** 98% full (only 4.8GB free)
- **Docker taking:** 22GB
- **This is blocking builds!**

---

## **🚀 RUN THESE COMMANDS:**

```bash
# 1. Stop Docker
killall Docker 2>/dev/null || true

# 2. Remove all Docker containers, images, volumes
docker system prune -a --volumes -f 2>/dev/null || true

# 3. Uninstall Docker app
rm -rf /Applications/Docker.app

# 4. Remove Docker data (22GB)
rm -rf ~/Library/Containers/com.docker.docker
rm -rf ~/Library/Application\ Support/Docker\ Desktop
rm -rf ~/Library/Group\ Containers/group.com.docker
rm -rf ~/.docker

# 5. Clean Xcode cache
rm -rf ~/Library/Developer/Xcode/DerivedData
rm -rf ~/Library/Caches/com.apple.dt.Xcode

# 6. Clean npm cache
npm cache clean --force

# 7. Clean CocoaPods cache
pod cache clean --all 2>/dev/null || true
```

**This will free ~30GB+**
