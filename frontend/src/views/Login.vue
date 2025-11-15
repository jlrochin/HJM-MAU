<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted transition-colors">
    <div class="max-w-md w-full px-4">
      <Card>
        <CardHeader class="text-center">
          <div class="flex items-center justify-center mb-4">
            <Hospital class="w-12 h-12 text-primary" />
          </div>
          <h2 class="text-3xl font-bold text-foreground">
            MAU Hospital
          </h2>
          <p class="mt-2 text-sm text-muted-foreground">
            Sistema de Gestión de Recetas
          </p>
        </CardHeader>

        <CardContent>
          <form @submit.prevent="handleSubmit" class="space-y-6">
            <div class="space-y-2">
              <Label for="username">
                <div class="flex items-center gap-2">
                  <User class="w-4 h-4" />
                  Usuario
                </div>
              </Label>
              <Input
                id="username"
                v-model="form.username"
                type="text"
                placeholder="Ingresa tu usuario"
                :disabled="isLoading"
                :error="!!errors.username"
              />
              <p v-if="errors.username" class="text-sm text-destructive mt-1">
                {{ errors.username }}
              </p>
            </div>

            <div class="space-y-2">
              <Label for="password">
                <div class="flex items-center gap-2">
                  <Lock class="w-4 h-4" />
                  Contraseña
                </div>
              </Label>
              <Input
                id="password"
                v-model="form.password"
                type="password"
                placeholder="Ingresa tu contraseña"
                :disabled="isLoading"
                :error="!!errors.password"
              />
              <p v-if="errors.password" class="text-sm text-destructive mt-1">
                {{ errors.password }}
              </p>
            </div>

            <div v-if="loginError" class="rounded-lg bg-destructive/10 border border-destructive/20 p-3">
              <div class="flex items-center gap-2">
                <AlertCircle class="w-4 h-4 text-destructive" />
                <p class="text-sm text-destructive">{{ loginError }}</p>
              </div>
            </div>

            <Button
              type="submit"
              :disabled="isLoading"
              class="w-full"
            >
              <Loader2 v-if="isLoading" class="w-4 h-4 mr-2 animate-spin" />
              <LogIn v-else class="w-4 h-4 mr-2" />
              {{ isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión' }}
            </Button>
          </form>

          <div class="mt-6 text-center">
            <p class="text-xs text-muted-foreground">
              Sistema desarrollado para MAU Hospital
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
</template>

<script>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useToast } from 'vue-toastification'
import { Hospital, User, Lock, LogIn, Loader2, AlertCircle } from 'lucide-vue-next'
import Card from '@/components/ui/Card.vue'
import CardHeader from '@/components/ui/CardHeader.vue'
import CardContent from '@/components/ui/CardContent.vue'
import Button from '@/components/ui/Button.vue'
import Input from '@/components/ui/Input.vue'
import Label from '@/components/ui/Label.vue'

export default {
  name: 'Login',
  components: {
    Card,
    CardHeader,
    CardContent,
    Button,
    Input,
    Label,
    Hospital,
    User,
    Lock,
    LogIn,
    Loader2,
    AlertCircle
  },
  setup() {
    const router = useRouter()
    const authStore = useAuthStore()
    const toast = useToast()
    
    const isLoading = ref(false)
    const loginError = ref('')
  // reCAPTCHA eliminado
    
    const form = reactive({
      username: '',
      password: ''
    })
    
    const errors = reactive({
      username: '',
      password: ''
    })
    
    const validateForm = () => {
      errors.username = ''
      errors.password = ''
      
      if (!form.username.trim()) {
        errors.username = 'El usuario es requerido'
        return false
      }
      
      if (!form.password.trim()) {
        errors.password = 'La contraseña es requerida'
        return false
      }
      
      if (form.password.length < 6) {
        errors.password = 'La contraseña debe tener al menos 6 caracteres'
        return false
      }
      
  // reCAPTCHA eliminado
      
      return true
    }
    
  // reCAPTCHA eliminado
    
    const handleSubmit = async () => {
      if (!validateForm()) return
      
      try {
        isLoading.value = true
        loginError.value = ''
        
        const loginData = {
          username: form.username,
          password: form.password
        }
        
        const result = await authStore.login(loginData)
        
        if (result.success) {
          toast.success(`¡Bienvenido, ${result.user.first_name}!`)
          router.push('/')
        } else {
          loginError.value = result.error
          // reCAPTCHA eliminado
        }
      } catch (error) {
        console.error('Error en login:', error)
        loginError.value = 'Error inesperado. Inténtalo de nuevo.'
  // reCAPTCHA eliminado
      } finally {
        isLoading.value = false
      }
    }
    
    return {
      form,
      errors,
      isLoading,
      loginError,
      
      handleSubmit,
      
    }
  }
}
</script>
