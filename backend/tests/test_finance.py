def test_finance_not_accessible_to_school_profile(client,register_login):
    from datetime import date
    _,user=register_login()
    profile={'full_name':'Perfil escolar ejemplo','city':'Cochabamba','graduation_year':date.today().year,
             'average_grade':89,'math_grade':90}
    assert client.put('/api/v1/usuario/escolar/perfil',json=profile,headers=user).status_code==200
    assert client.get('/api/v1/usuario/finanzas/resumen',headers=user).status_code in (403,404)
