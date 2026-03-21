from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import UnidadViewSet, ResidenteViewSet

router = DefaultRouter()
router.register(r'unidades', UnidadViewSet)
router.register(r'residentes', ResidenteViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
