# AI Coding Agent Integration Instructions

## 📋 Plugin Update Summary

The WordPress Remote Manager plugin has been enhanced with the missing endpoints you requested:

### ✅ NEW ENDPOINTS ADDED:
- `/wp-json/wrm/v1/updates/perform` - Execute bulk updates for plugins, themes, and WordPress core
- `/wp-json/wrm/v1/maintenance` - Manage maintenance mode (GET/POST)
- `/wp-json/wrm/v1/activate-plugin` - Activate plugins remotely
- `/wp-json/wrm/v1/deactivate-plugin` - Deactivate plugins remotely
- `/wp-json/wrm/v1/update-plugin` - Update individual plugins
- `/wp-json/wrm/v1/update-theme` - Update individual themes
- `/wp-json/wrm/v1/update-wordpress` - Update WordPress core

### 🔧 Key Features Added:
- **Bulk Update Support**: Update multiple plugins/themes/core in one request
- **Maintenance Mode**: Automatic and manual maintenance mode management
- **Plugin Management**: Remote activation/deactivation capabilities
- **Error Handling**: Comprehensive error reporting and recovery
- **Security**: Full WordPress capability checks and API key authentication

## 🚀 For AI Coding Agents - Dashboard Integration

### Required Environment Variables
```bash
WORDPRESS_URL=https://your-site.com
WORDPRESS_API_KEY=your_generated_api_key
```

### Backend API Route Updates Required

Update your `server/routes.ts` to handle the new functionality:

```typescript
// Add these new route handlers to your existing routes

// Perform updates endpoint
app.post('/api/updates/perform', async (req, res) => {
  try {
    const response = await fetch(`${process.env.WORDPRESS_URL}/wp-json/wrm/v1/updates/perform`, {
      method: 'POST',
      headers: {
        'X-WRM-API-Key': process.env.WORDPRESS_API_KEY!,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(req.body)
    });
    
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Update failed' });
  }
});

// Maintenance mode endpoint
app.get('/api/maintenance', async (req, res) => {
  try {
    const response = await fetch(`${process.env.WORDPRESS_URL}/wp-json/wrm/v1/maintenance`, {
      headers: { 'X-WRM-API-Key': process.env.WORDPRESS_API_KEY! }
    });
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to get maintenance status' });
  }
});

app.post('/api/maintenance', async (req, res) => {
  try {
    const response = await fetch(`${process.env.WORDPRESS_URL}/wp-json/wrm/v1/maintenance`, {
      method: 'POST',
      headers: {
        'X-WRM-API-Key': process.env.WORDPRESS_API_KEY!,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(req.body)
    });
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to toggle maintenance mode' });
  }
});

// Plugin management endpoints
app.post('/api/activate-plugin', async (req, res) => {
  try {
    const response = await fetch(`${process.env.WORDPRESS_URL}/wp-json/wrm/v1/activate-plugin`, {
      method: 'POST',
      headers: {
        'X-WRM-API-Key': process.env.WORDPRESS_API_KEY!,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(req.body)
    });
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to activate plugin' });
  }
});

app.post('/api/deactivate-plugin', async (req, res) => {
  try {
    const response = await fetch(`${process.env.WORDPRESS_URL}/wp-json/wrm/v1/deactivate-plugin`, {
      method: 'POST',
      headers: {
        'X-WRM-API-Key': process.env.WORDPRESS_API_KEY!,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(req.body)
    });
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to deactivate plugin' });
  }
});
```

### Frontend Component Updates

Add these React components to enable update functionality:

```tsx
// UpdateButton Component
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface UpdateButtonProps {
  type: 'plugin' | 'theme' | 'core';
  item: string;
  name: string;
}

export function UpdateButton({ type, item, name }: UpdateButtonProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const updateMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/updates/perform', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          updates: [{
            type,
            items: [item]
          }]
        })
      });
      return response.json();
    },
    onSuccess: (data) => {
      if (data.success) {
        toast({
          title: "Update Successful",
          description: `${name} has been updated successfully.`,
        });
        
        // Refresh all relevant data
        queryClient.invalidateQueries({ queryKey: ['/api/plugins'] });
        queryClient.invalidateQueries({ queryKey: ['/api/themes'] });
        queryClient.invalidateQueries({ queryKey: ['/api/updates'] });
        queryClient.invalidateQueries({ queryKey: ['/api/site-status'] });
      }
    },
    onError: () => {
      toast({
        title: "Update Failed",
        description: `Failed to update ${name}. Please try again.`,
        variant: "destructive",
      });
    }
  });

  return (
    <Button 
      onClick={() => updateMutation.mutate()}
      disabled={updateMutation.isPending}
      size="sm"
    >
      {updateMutation.isPending ? 'Updating...' : 'Update'}
    </Button>
  );
}

// MaintenanceToggle Component
export function MaintenanceToggle() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const { data: maintenanceStatus } = useQuery({
    queryKey: ['/api/maintenance'],
  });
  
  const toggleMaintenance = useMutation({
    mutationFn: async (enable: boolean) => {
      const response = await fetch('/api/maintenance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enable })
      });
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: data.maintenance_mode ? "Maintenance Mode Enabled" : "Maintenance Mode Disabled",
        description: data.message,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/maintenance'] });
    }
  });

  return (
    <div className="flex items-center space-x-2">
      <Button
        variant={maintenanceStatus?.maintenance_mode ? "destructive" : "outline"}
        onClick={() => toggleMaintenance.mutate(!maintenanceStatus?.maintenance_mode)}
        disabled={toggleMaintenance.isPending}
      >
        {maintenanceStatus?.maintenance_mode ? 'Disable Maintenance' : 'Enable Maintenance'}
      </Button>
    </div>
  );
}

// PluginActionButton Component
interface PluginActionButtonProps {
  plugin: {
    path: string;
    name: string;
    active: boolean;
  };
}

export function PluginActionButton({ plugin }: PluginActionButtonProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const togglePlugin = useMutation({
    mutationFn: async () => {
      const endpoint = plugin.active ? '/api/deactivate-plugin' : '/api/activate-plugin';
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plugin: plugin.path })
      });
      return response.json();
    },
    onSuccess: (data) => {
      if (data.success) {
        toast({
          title: `Plugin ${plugin.active ? 'Deactivated' : 'Activated'}`,
          description: data.message,
        });
        queryClient.invalidateQueries({ queryKey: ['/api/plugins'] });
      }
    }
  });

  return (
    <Button
      variant={plugin.active ? "destructive" : "default"}
      size="sm"
      onClick={() => togglePlugin.mutate()}
      disabled={togglePlugin.isPending}
    >
      {togglePlugin.isPending 
        ? 'Processing...' 
        : (plugin.active ? 'Deactivate' : 'Activate')
      }
    </Button>
  );
}
```

### Schema Updates

Add these types to your `shared/schema.ts`:

```typescript
// Add to existing schema
export interface UpdateRequest {
  updates: Array<{
    type: 'plugin' | 'theme' | 'core';
    items: string[];
  }>;
}

export interface UpdateResult {
  type: string;
  item: string;
  success: boolean;
  message: string;
}

export interface UpdateResponse {
  success: boolean;
  results: UpdateResult[];
  timestamp: string;
}

export interface MaintenanceStatus {
  maintenance_mode: boolean;
  status: 'active' | 'inactive';
}

export interface PluginActionRequest {
  plugin: string;
}
```

## 🎯 Integration Steps for AI Agent

1. **Install the Enhanced Plugin**: Replace the current WordPress plugin with `wp-remote-manager-enhanced.php`

2. **Update Backend Routes**: Add the new API endpoints to your Express server

3. **Update Frontend Components**: Add update buttons and maintenance mode toggle to your UI

4. **Test Functionality**: 
   - Test individual plugin updates
   - Test bulk updates
   - Test maintenance mode toggle
   - Test plugin activation/deactivation

5. **Update Schema**: Add TypeScript types for the new functionality

## 🔍 Testing Checklist

After integration, verify these features work:

- [ ] Individual plugin updates via Update button
- [ ] Individual theme updates via Update button  
- [ ] WordPress core updates
- [ ] Bulk updates (multiple plugins/themes at once)
- [ ] Maintenance mode enable/disable
- [ ] Plugin activation/deactivation
- [ ] Error handling for failed operations
- [ ] Success notifications and data refresh
- [ ] Loading states during operations

## 🛡️ Security Notes

- All endpoints require valid API key authentication
- WordPress capability checks ensure proper user permissions
- Maintenance mode is automatically enabled during updates for safety
- Comprehensive error handling prevents partial failures

## 📊 Expected User Experience

With these updates integrated:

1. **One-Click Updates**: Users can update plugins, themes, and WordPress core with single clicks
2. **Maintenance Management**: Users can manually control maintenance mode
3. **Plugin Management**: Users can activate/deactivate plugins remotely
4. **Real-Time Feedback**: Loading states and success/error notifications
5. **Bulk Operations**: Update multiple items simultaneously for efficiency

Your WordPress Remote Manager dashboard will now be fully functional with complete update capabilities!