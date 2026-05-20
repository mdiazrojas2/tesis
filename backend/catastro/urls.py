from .views import CondominioViewSet, UnidadViewSet, ResidenteViewSet, DocumentoViewSet, NotificacionViewSet, EstablecerClaveView

router = DefaultRouter()
router.register(r'condominios', CondominioViewSet)
router.register(r'unidades', UnidadViewSet)
router.register(r'residentes', ResidenteViewSet)
router.register(r'documentos', DocumentoViewSet)
router.register(r'notificaciones', NotificacionViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('establecer-clave/', EstablecerClaveView.as_view({'post': 'create'}), name='establecer-clave'),
]
